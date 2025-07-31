// Updated pto.js routes - Add approval endpoints
const express = require('express');
const router = express.Router();
const PTORequest = require('../database/models/PTORequest');
const authenticateToken = require('../middleware/auth');

// Create a PTO request
router.post('/', async (req, res) => {
  try {
    const { nurseId, startDate, endDate, reason } = req.body;
    const pto = new PTORequest({ nurseId, startDate, endDate, reason });
    await pto.save();
    res.status(201).json(pto);
    console.log(pto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all PTO requests (Admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const ptos = await PTORequest.find()
      .populate('nurseId', 'name username email')
      .populate('reviewedBy', 'name username')
      .sort({ createdAt: -1 });
    res.json(ptos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get PTO requests for a specific nurse
router.get('/nurse/:nurseId', async (req, res) => {
  try {
    const { nurseId } = req.params;
    const ptos = await PTORequest.find({ nurseId })
      .populate('reviewedBy', 'name username')
      .sort({ createdAt: -1 });
    res.json(ptos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve PTO request (Admin only)
router.put('/:ptoId/approve', authenticateToken, async (req, res) => {
  try {
    const { ptoId } = req.params;
    const { reviewNotes } = req.body;
    const adminId = req.user.Id; // From JWT token

    const pto = await PTORequest.findByIdAndUpdate(
      ptoId,
      {
        status: 'approved',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || null
      },
      { new: true }
    ).populate('nurseId', 'name username email');

    if (!pto) {
      return res.status(404).json({ error: 'PTO request not found' });
    }

    res.json({
      success: true,
      message: 'PTO request approved successfully',
      data: pto
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deny PTO request (Admin only)
router.put('/:ptoId/deny', authenticateToken, async (req, res) => {
  try {
    const { ptoId } = req.params;
    const { reviewNotes } = req.body;
    const adminId = req.user.Id; // From JWT token

    if (!reviewNotes) {
      return res.status(400).json({ 
        error: 'Review notes are required when denying a PTO request' 
      });
    }

    const pto = await PTORequest.findByIdAndUpdate(
      ptoId,
      {
        status: 'denied',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes
      },
      { new: true }
    ).populate('nurseId', 'name username email');

    if (!pto) {
      return res.status(404).json({ error: 'PTO request not found' });
    }

    res.json({
      success: true,
      message: 'PTO request denied',
      data: pto
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel PTO request (Nurse can cancel their own pending requests)
router.put('/:ptoId/cancel', async (req, res) => {
  try {
    const { ptoId } = req.params;

    const pto = await PTORequest.findById(ptoId);
    
    if (!pto) {
      return res.status(404).json({ error: 'PTO request not found' });
    }

    if (pto.status !== 'pending') {
      return res.status(400).json({ 
        error: 'Only pending PTO requests can be cancelled' 
      });
    }

    pto.status = 'cancelled';
    await pto.save();

    res.json({
      success: true,
      message: 'PTO request cancelled successfully',
      data: pto
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get PTO statistics for admin dashboard
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await PTORequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statsObj = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    // Get recent requests (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRequests = await PTORequest.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        byStatus: statsObj,
        recentRequests: recentRequests,
        totalRequests: stats.reduce((sum, stat) => sum + stat.count, 0)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;