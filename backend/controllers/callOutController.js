const PTORequest = require('../database/models/PTORequest');
const Nurse = require('../database/models/nurse');

/**
 * @route   POST /api/callout/report
 * @desc    Report a call-out (illness/emergency absence)
 * @access  Nurse
 */
const reportCallOut = async (req, res) => {
    try {
        const { shiftDate, absenceType, reason, estimatedDuration, contactNumber } = req.body;
        const nurseId = req.user?.Id; // From JWT token
        
        console.log('[DEBUG] Call-out report received:', {
            nurseId,
            shiftDate,
            absenceType,
            reason,
            estimatedDuration,
            contactNumber
        });

        if (!nurseId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        if (!shiftDate || !absenceType || !contactNumber) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: shiftDate, absenceType, and contactNumber are required'
            });
        }

        // Verify nurse exists
        const nurse = await Nurse.findById(nurseId);
        if (!nurse) {
            return res.status(404).json({
                success: false,
                message: 'Nurse not found'
            });
        }

        // Calculate urgency based on time until shift
        const now = new Date();
        const shift = new Date(shiftDate);
        const hoursUntil = (shift - now) / (1000 * 60 * 60);
        
        let urgencyLevel = 'normal';
        if (hoursUntil < 2) urgencyLevel = 'critical';
        else if (hoursUntil < 8) urgencyLevel = 'urgent';
        else if (hoursUntil < 24) urgencyLevel = 'high';

        // Create a special PTO request for call-outs
        const callOutRecord = new PTORequest({
            nurseId: nurseId,
            startDate: shiftDate,
            endDate: shiftDate, // Same day for call-out
            reason: `🚨 CALL-OUT: ${absenceType.toUpperCase()} - ${reason || estimatedDuration || 'Emergency absence'}`,
            status: 'approved', // Auto-approve call-outs for tracking
            callOutData: { // Store additional call-out specific data
                absenceType,
                urgencyLevel,
                contactNumber,
                estimatedDuration,
                reportedAt: new Date(),
                isCallOut: true
            }
        });

        await callOutRecord.save();

        console.log(`[INFO] Call-out recorded for nurse ${nurse.name} - ${absenceType} - ${urgencyLevel} priority`);

        res.status(201).json({
            success: true,
            message: 'Call-out reported successfully',
            data: {
                callOutId: callOutRecord._id,
                nurseId: nurseId,
                nurseName: nurse.name,
                shiftDate: shiftDate,
                absenceType: absenceType,
                urgencyLevel: urgencyLevel,
                reportedAt: callOutRecord.createdAt,
                status: 'reported',
                nextSteps: [
                    'Your supervisor has been notified immediately',
                    'The on-call coordinator is being contacted',
                    urgencyLevel === 'critical' ? 'Emergency protocols activated' : 'Replacement search initiated',
                    'You may be contacted for additional information'
                ]
            }
        });

    } catch (error) {
        console.error('[ERROR] Error reporting call-out:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to report call-out',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/callout/recent/:nurseId
 * @desc    Get recent call-outs for a nurse
 * @access  Nurse (own) / Admin (any)
 */
const getRecentCallOuts = async (req, res) => {
    try {
        const { nurseId } = req.params;
        const requestingUserId = req.user?.Id;

        // Check authorization
        if (requestingUserId !== nurseId && !req.user?.roles?.includes('admin')) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Find recent call-outs (PTO requests with call-out data)
        const recentCallOuts = await PTORequest.find({
            nurseId: nurseId,
            reason: { $regex: /🚨 CALL-OUT:/i },
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        })
        .populate('nurseId', 'name username')
        .sort({ createdAt: -1 })
        .limit(10);

        res.status(200).json({
            success: true,
            data: recentCallOuts
        });

    } catch (error) {
        console.error('[ERROR] Error fetching call-outs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch call-outs',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/callout/dashboard
 * @desc    Get call-out dashboard data for admin
 * @access  Admin only
 */
const getCallOutDashboard = async (req, res) => {
    try {
        if (!req.user?.roles?.includes('admin')) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const today = new Date();
        const last24Hours = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Get recent call-outs
        const recentCallOuts = await PTORequest.find({
            reason: { $regex: /🚨 CALL-OUT:/i },
            createdAt: { $gte: last7Days }
        })
        .populate('nurseId', 'name username')
        .sort({ createdAt: -1 });

        // Calculate statistics
        const stats = {
            total: recentCallOuts.length,
            last24Hours: recentCallOuts.filter(c => c.createdAt >= last24Hours).length,
            byType: {},
            byUrgency: {
                critical: 0,
                urgent: 0,
                high: 0,
                normal: 0
            }
        };

        // Analyze call-outs
        recentCallOuts.forEach(callOut => {
            // Extract type from reason
            const reasonMatch = callOut.reason.match(/🚨 CALL-OUT: (\w+)/);
            const type = reasonMatch ? reasonMatch[1].toLowerCase() : 'unknown';
            
            stats.byType[type] = (stats.byType[type] || 0) + 1;
            
            // Determine urgency (simplified)
            const hoursSinceCreated = (today - callOut.createdAt) / (1000 * 60 * 60);
            if (callOut.reason.includes('CRITICAL') || hoursSinceCreated < 2) {
                stats.byUrgency.critical++;
            } else if (callOut.reason.includes('URGENT') || hoursSinceCreated < 8) {
                stats.byUrgency.urgent++;
            } else if (hoursSinceCreated < 24) {
                stats.byUrgency.high++;
            } else {
                stats.byUrgency.normal++;
            }
        });

        res.status(200).json({
            success: true,
            data: {
                statistics: stats,
                recentCallOuts: recentCallOuts.slice(0, 20), // Last 20 call-outs
                alerts: {
                    criticalCallOuts: stats.byUrgency.critical,
                    todayCallOuts: stats.last24Hours
                }
            }
        });

    } catch (error) {
        console.error('[ERROR] Error fetching call-out dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: error.message
        });
    }
};

module.exports = {
    reportCallOut,
    getRecentCallOuts,
    getCallOutDashboard
};