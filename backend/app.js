const express = require('express')
const mongoose = require('mongoose')
const config = require('./utils/config')
const cors = require('cors') 
const routes = require("./routes/routes");
const studyPlanRoutes = require("./routes/studyPlan");
const quizRoutes = require("./routes/quiz");
const progressRoutes = require("./routes/progress");
const userRoutes = require("./routes/user");
const notificationRoutes = require('./routes/notifications');
const dashboardRoutes = require('./routes/dashboard');
const testRoutes = require('./routes/testRoutes');

mongoose.connect(config.MONGODB_URI).then(() => {
    console.log(`MongoDB connected`);
})
.catch(error => console.log(`${error}`))

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api', routes);
app.use("/api/users", userRoutes);
app.use("/study-plan", studyPlanRoutes);
app.use("/quiz", quizRoutes);
app.use("/progress", progressRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use("/api", require("./routes/testRoutes"));
const { initializeMockTests } = require("./controllers/mockTestController");
initializeMockTests();

module.exports = app