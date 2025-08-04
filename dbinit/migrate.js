const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const Nurse = require('./models/nurse');
const Admin = require('./models/admin');
const PTORequest = require('./models/PTORequest');
const WorkDay = require('./models/workDay');
const Assignment = require('./models/workAssignment');

async function runMigration() {
  // Add retry logic with timeout
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 2000; // 2 seconds
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://mongodb:27017/NICU-db', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000 // 5 second timeout
      });
      console.log('Connected to MongoDB');
      break;
    } catch (err) {
      if (i === MAX_RETRIES - 1) {
        console.error('Failed to connect after retries:', err);
        process.exit(1);
      }
      console.log(`Connection attempt ${i + 1} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }

  await mongoose.connection.dropDatabase();
  console.log('Cleared existing database');

  const toObjectId = (id) => {
    if (typeof id === 'object' && id.$oid) {
      return new mongoose.Types.ObjectId(id.$oid);
    }
    return new mongoose.Types.ObjectId(id);
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return new Date().toISOString();
    return dateStr.includes('T') 
      ? dateStr 
      : new Date(`${dateStr}T00:00:00Z`).toISOString();
  };

  const transformNurse = (nurse) => ({
    _id: new mongoose.Types.ObjectId(nurse.empID?.$oid || nurse.empID),
    name: nurse.name,
    username: nurse.username,
    password: nurse.password,
    email: nurse.email,
    phone: nurse.phone,
    availability: nurse.availability,
    maxWeeklyHours: nurse.maxWeeklyHours,
    currentWeeklyHours: nurse.currentWeeklyHours || 0
  });

  const transformAdmin = (admin) => ({
    _id: new mongoose.Types.ObjectId(admin.adminID?.$oid || admin.adminID),
    name: admin.name,
    username: admin.username,
    password: admin.password,
    email: admin.email,
    phone: admin.phone
  });

  const transformPTORequest = (request) => ({
    _id: new mongoose.Types.ObjectId(request.requestId?.$oid || request.requestId),
    nurseId: toObjectId(request.empID),
    startDate: formatTimestamp(request.startDate),
    endDate: formatTimestamp(request.endDate),
    reason: request.reason,
    status: request.status,
    createdAt: formatTimestamp(request.createdAt)
  });

  const transformWorkDay = (workday) => ({
    _id: new mongoose.Types.ObjectId(workday.workID?.$oid || workday.workID),
    date: new Date(workday.date).toISOString(),
    shiftType: workday.shiftType,
    requiredEmployees: workday.requiredEmployees
  });

  const transformAssignments = (assignment) => ({
    workID: toObjectId(assignment.workID),
    empID: toObjectId(assignment.empID),
    assignedby: assignment.assignedby,
    timestamp: formatTimestamp(assignment.timestamp)
});


  try {
    // Nurses
    const nursesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/nurses.json')));
    const nurses = Array.isArray(nursesData) ? nursesData : [nursesData];
    await Nurse.insertMany(nurses.map(transformNurse));
    console.log(`Inserted ${nurses.length} nurses`);

    // Admin
    const adminsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/admins.json')));
    const admins = Array.isArray(adminsData) ? adminsData : [adminsData];
    await Admin.insertMany(admins.map(transformAdmin));
    console.log(`Inserted ${admins.length} admins`);

    // PTORequests
    const requestsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/requests.json')));
    const requests = Array.isArray(requestsData) ? requestsData : [requestsData];
    await PTORequest.insertMany(requests.map(transformPTORequest));
    console.log(`Inserted ${requests.length} PTO requests`);

    // WorkDays
    const workdaysData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/workdays.json')));
    const workdays = Array.isArray(workdaysData) ? workdaysData : [workdaysData];
    await WorkDay.insertMany(workdays.map(transformWorkDay));
    console.log(`Inserted ${workdays.length} workdays`);

    // Assignments
    const assignmentsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/assignments.json')));
    const assignments = Array.isArray(assignmentsData) ? assignmentsData : [assignmentsData];
    await Assignment.insertMany(assignments.map(transformAssignments));
    console.log(`Inserted ${assignments.length} Work Assignments`);

    await mongoose.connection.close();
    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();