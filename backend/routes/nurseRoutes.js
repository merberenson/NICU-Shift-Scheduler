const express = require('express');
const router = express.Router();
const Nurse = require('../database/models/nurse');
const authenticateToken = require('../middleware/auth');


/**
 * @route   GET /api/nurses/:id/availability
 * @desc    Get nurse's current availability
 * @access  Authenticated (Nurse can get their own, Admin can get any)
 */
router.get('/:id/availability', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('[DEBUG] GET availability - URL param id:', id);
        console.log('[DEBUG] GET availability - req.user:', req.user);
        console.log('[DEBUG] GET availability - req.user.Id:', req.user?.Id);
        
        const userIdFromToken = req.user?.Id?.toString();
        const requestedId = id.toString();
        
        console.log('[DEBUG] Comparing userIdFromToken:', userIdFromToken, 'with requestedId:', requestedId);
        
        const isAdmin = req.user?.roles?.includes('admin') || req.user?.role === 'admin';
        const isOwnData = userIdFromToken === requestedId;
        
        console.log('[DEBUG] isAdmin:', isAdmin, 'isOwnData:', isOwnData);
        
        if (!isOwnData && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only view your own availability.'
            });
        }

        const nurse = await Nurse.findById(id).select('availability name username');
        
        if (!nurse) {
            return res.status(404).json({
                success: false,
                message: 'Nurse not found'
            });
        }

        // If no availability set, return default unavailable schedule
        const defaultAvailability = [
            'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
        ].map(day => ({ dayOfWeek: day, timeOfDay: 'unavailable' }));

        res.status(200).json({
            success: true,
            data: {
                nurseId: nurse._id,
                name: nurse.name,
                username: nurse.username,
                availability: nurse.availability || defaultAvailability
            }
        });

    } catch (error) {
        console.error('[ERROR] Error fetching nurse availability:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching availability',
            error: error.message
        });
    }
});

/**
 * @route   PATCH /api/nurses/:id/availability
 * @desc    Update nurse's availability
 * @access  Authenticated (Nurse can update their own, Admin can update any)
 */
router.patch('/:id/availability', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { availability } = req.body;
        
        console.log('[DEBUG] PATCH availability - URL param id:', id);
        console.log('[DEBUG] PATCH availability - req.user:', req.user);
        console.log('[DEBUG] PATCH availability - req.user.Id:', req.user?.Id);
        
        const userIdFromToken = req.user?.Id?.toString();
        const requestedId = id.toString();
        
        console.log('[DEBUG] Comparing userIdFromToken:', userIdFromToken, 'with requestedId:', requestedId);
        
        const isAdmin = req.user?.roles?.includes('admin') || req.user?.role === 'admin';
        const isOwnData = userIdFromToken === requestedId;
        
        console.log('[DEBUG] isAdmin:', isAdmin, 'isOwnData:', isOwnData);
        
        if (!isOwnData && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only update your own availability.'
            });
        }

        // Validate availability format
        if (!Array.isArray(availability)) {
            return res.status(400).json({
                success: false,
                message: 'Availability must be an array'
            });
        }

        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const validTimes = ['day', 'night', 'unavailable'];

        // Validate each availability entry
        for (const entry of availability) {
            if (!entry.dayOfWeek || !entry.timeOfDay) {
                return res.status(400).json({
                    success: false,
                    message: 'Each availability entry must have dayOfWeek and timeOfDay'
                });
            }

            if (!validDays.includes(entry.dayOfWeek)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid day: ${entry.dayOfWeek}. Must be one of: ${validDays.join(', ')}`
                });
            }

            if (!validTimes.includes(entry.timeOfDay)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid time: ${entry.timeOfDay}. Must be one of: ${validTimes.join(', ')}`
                });
            }
        }

        // Ensure all 7 days are present
        const providedDays = availability.map(entry => entry.dayOfWeek);
        const missingDays = validDays.filter(day => !providedDays.includes(day));
        
        if (missingDays.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing availability for: ${missingDays.join(', ')}`
            });
        }

        // Update the nurse's availability
        const nurse = await Nurse.findByIdAndUpdate(
            id,
            { 
                availability,
                lastAvailabilityUpdate: new Date()
            },
            { 
                new: true,
                runValidators: true
            }
        ).select('availability name username lastAvailabilityUpdate');

        if (!nurse) {
            return res.status(404).json({
                success: false,
                message: 'Nurse not found'
            });
        }

        console.log(`[INFO] Updated availability for nurse ${nurse.name} (${nurse.username})`);

        res.status(200).json({
            success: true,
            message: 'Availability updated successfully',
            data: {
                nurseId: nurse._id,
                name: nurse.name,
                username: nurse.username,
                availability: nurse.availability,
                lastUpdated: nurse.lastAvailabilityUpdate
            }
        });

    } catch (error) {
        console.error('[ERROR] Error updating nurse availability:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating availability',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/nurses/:id/profile
 * @desc    Get nurse's profile information
 * @access  Authenticated (Nurse can get their own, Admin can get any)
 */
router.get('/:id/profile', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('[DEBUG] GET profile - URL param id:', id);
        console.log('[DEBUG] GET profile - req.user:', req.user);
        console.log('[DEBUG] GET profile - req.user.Id:', req.user?.Id);
        
        const userIdFromToken = req.user?.Id?.toString();
        const requestedId = id.toString();
        
        console.log('[DEBUG] Comparing userIdFromToken:', userIdFromToken, 'with requestedId:', requestedId);
        
        // Check if user is accessing their own data or is admin
        const isAdmin = req.user?.roles?.includes('admin') || req.user?.role === 'admin';
        const isOwnData = userIdFromToken === requestedId;
        
        console.log('[DEBUG] isAdmin:', isAdmin, 'isOwnData:', isOwnData);
        
        if (!isOwnData && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only view your own profile.'
            });
        }

        const nurse = await Nurse.findById(id).select('-password');
        
        if (!nurse) {
            return res.status(404).json({
                success: false,
                message: 'Nurse not found'
            });
        }

        res.status(200).json({
            success: true,
            data: nurse
        });

    } catch (error) {
        console.error('[ERROR] Error fetching nurse profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching profile',
            error: error.message
        });
    }
});

module.exports = router;