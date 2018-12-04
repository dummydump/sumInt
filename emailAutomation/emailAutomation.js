var http = require('http');
var CronJob = require('cron').CronJob;
var model = require('../models/model');
var ObjectID = require('mongodb').ObjectID;
var EMAIL_AUTOMATION_COLLECTION = model.email_automation;
var TEMPLATES_COLLECTION = model.templates;
var CLIENTS_COLLECTION = model.clients;
var EMAIL_AUTOMATION_COLLECTION_HISTORY = model.email_automation_history;
var COMMON_ROUTE = require('./../controller/common');
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
var moment = require('moment');

var EMAIL_HISTORY = {
    templateId: '',
    sendDate: '',
    sendTime: '',
    status: '',
    errorMessage: '',
    clientId: '',
    subject: ''
};

var SEND_EMAIL_OPTIONS = {
    from: '', // sender address
    to: '', // list of receivers
    subject: '', // Subject line
    text: '', // plaintext body
    html: '', // html body
    body: ''
};

class emailAutomation {
    constructor() {
        this.templates = {};
        this.tasks = [];
    }

    initEmailSchedule(e, res) {
        var self = this;
        // for (var i = 0; i<500; i++){
        //     var doc1 = {
        //         "workspaceExtensionId" : "5ad84e8293293a28e8473f1a",
        //         "templateId" : "5ad71d7471577daa38e33861",
        //         "sendDate" : "2018-06-18",
        //         "sendTime" : "00:00",
        //         "status" : "0",
        //         "clientId" : "5abbd9489ffe720010135fc4",
        //         "nextDate" : "2020-05-12",
        //         "recurrenceFrequency" : "yearly",
        //         "subject": "Test automation mail " + i,
        //         "placeholders" : {}
        //     };
        //     var auto = new EMAIL_AUTOMATION_COLLECTION(doc1);
        //     console.log(' auto ' + JSON.stringify(auto.subject));
        //     auto.save(function (error, email) {
        //         if (error) {
        //             console.log('Error in adding new email!' +  error);
        //         } else {
        //             console.log('New email added successfully!' +  auto.subject);
        //         }
        //     });
        // };
        // new CronJob('00 */2 * * * *', function() {
        //     console.log('You will see this message every second' + new Date().getTime());
        //     self.getEmailTasks();
        // }, function () {
        //     /* This function is executed when the job stops */
        //     console.log('This function is executed when the job stops');
        // }, true, 'America/Los_Angeles');

        // self.getEmailTasks();
        var mailOptions = Object.create(SEND_EMAIL_OPTIONS);
        mailOptions.to = 'dev.team@jstigers.com'; //_contact.value;
        mailOptions.subject = 'test';
        mailOptions.text = '';
        mailOptions.html = 'test1';
        mailOptions.body = 'test body';

        // console.log('************ process.env.SENDGRID_USER ' + process.env.SENDGRID_USER);
        // console.log('************ process.env.SENDGRID_PASSWORD ' + process.env.SENDGRID_PASSWORD);
        // self.sendMail(mailOptions, (error, message) => {
        //     console.log('************ final ' );
        //  });
    }

    getEmailTasks() {
        // var todayDateString = this.getDateString(new Date());
        var todayDateString = '2019-06-18';
        console.log(' todayDateString ' + todayDateString);
        var query = {
            $or: [
                { sendDate: todayDateString },
                { nextDate: todayDateString }
            ]
        };

        var self = this;
        EMAIL_AUTOMATION_COLLECTION.find(query, function(emailAutomationerror, emailAutomations) {
            // console.log('emailAutomationerror ' + JSON.stringify(emailAutomationerror));
            // console.log('emailAutomations ' + JSON.stringify(emailAutomations));
            
            if (emailAutomationerror || !emailAutomations) {
                // todo: error handling
            } else {
                self.tasks = emailAutomations;
                self.iterateEmailTasks(emailAutomations);
            }
        });
    }

    iterateEmailTasks() {
        var emailTask = '';
        var self = this;
        var _emailHistory = Object.create(EMAIL_HISTORY);
        var _template = {};
        //tasks.forEach((task, index) => {
            
            self.sendAutomationEmail(self.tasks[0], 0, self.tasks.length, self.tasks);
       // }, this);
    }

    sendAutomationEmail(emailTask, index, totalLength){
        var self = this;
        console.log('emailTask.subject ' + emailTask.subject + ' index ' + index + ' tasks ' + self.tasks.length);
        if((index + 1) >= totalLength){
            console.log('all mail send Successfully index ' + index);
        } else {
            if(!emailTask){
                index++;
                self.sendAutomationEmail(self.tasks[index], index, self.tasks.length);
            } else {
                var _emailHistory = Object.create(EMAIL_HISTORY);
                _emailHistory.templateId = emailTask.templateId;
                _emailHistory.sendDate = emailTask.sendDate;
                _emailHistory.sendTime = emailTask.sendTime;
                _emailHistory.status = emailTask.status;
                _emailHistory.clientId = emailTask.clientId;
                self.getTemplateById(emailTask.templateId, function(template) {
                    var _template = template;
                    self.getClient(emailTask.clientId, function(client) {
                        if (client.contactDetails && client.contactDetails.length > 0) {
                            var _contact = self.getClientEmailAdress(client.contactDetails)
                            if (_contact) {
                                var mailOptions = Object.create(SEND_EMAIL_OPTIONS);
                                mailOptions.to = 'dev.team@jstigers.com'; //_contact.value;
                                mailOptions.subject = emailTask.subject;
                                mailOptions.text = '';
                                mailOptions.html = _template.body;
                                mailOptions.body = _template.body;
                                self.sendMail(mailOptions, (error, message) => {
                                    console.log('************ sendMail ' + index);
                                    if (error) {
                                        _emailHistory.status = "0";
                                        _emailHistory.errorMessage = error;
                                        self.addEmailAutomationHistory(_emailHistory);
                                        if (emailTask.recurrenceFrequency !== '') {
                                            self.updateRecurringEmailAutomation(emailTask);
                                        }
                                        index++;
                                        self.sendAutomationEmail(self.tasks[index], index, self.tasks.length);
                                    } else {
                                        _emailHistory.status = "1";
                                        _emailHistory.errorMessage = "Email sent Successfully";
                                        self.addEmailAutomationHistory(_emailHistory);
                                        if (emailTask.recurrenceFrequency !== '') {
                                            self.updateRecurringEmailAutomation(emailTask);
                                        }
                                        index++;
                                        self.sendAutomationEmail(self.tasks[index], index, self.tasks.length);
                                    }
                                    //TODO
                                })
                            } else {
                                _emailHistory.status = "0";
                                _emailHistory.errorMessage = " client's email is not found";
                                self.addEmailAutomationHistory(_emailHistory);
                                index++;
                                self.sendAutomationEmail(self.tasks[index], index, self.tasks.length);
                            }
                        } else {
                            _emailHistory.status = "0";
                            _emailHistory.errorMessage = " No client contact details are found";
                            self.addEmailAutomationHistory(_emailHistory);
                            index++;
                            self.sendAutomationEmail(self.tasks[index], index, self.tasks.length);
                        }
                    },
                    function(err) {
                        _emailHistory.status = "0";
                        _emailHistory.errorMessage = "Client is not found";
                        self.addEmailAutomationHistory(_emailHistory);
                        index++;
                        self.sendAutomationEmail(self.tasks[index], index, self.tasks.length);
                    });
                },
                function(err) {
                    //Template is not found: err.message
                    _emailHistory.status = "0";
                    _emailHistory.errorMessage = "Template is not found";
                    self.addEmailAutomationHistory(_emailHistory);
                    index++;
                    self.sendAutomationEmail(self.tasks[index], index, self.tasks.length);
                });
            }
        }
    }


    getDateString(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    getTemplateById(templateId, success, error) {
        if (this.templates[templateId]) {
            success(this.templates[templateId]);
        } else {
            var self = this;
            TEMPLATES_COLLECTION.findOne({ _id: new ObjectID(templateId) }, (templateerror, getTemplate) => {
                if (templateerror || !getTemplate) {
                    error({ message: "Template is not found" });
                } else {
                    self.templates[templateId] = getTemplate;
                    success(getTemplate);
                }
            });
        }
    }

    getClient(clientId, success, error) {
        var query = { _id: new ObjectID(clientId) };

        CLIENTS_COLLECTION.findOne(query, function(clienterror, getClient) {
            if (clienterror || !getClient) {
                error({ message: "Client is not found" });
            } else {
                success(getClient);
            }
        });
    }

    getClientEmailAdress(_details) {
        for (var i = 0; i < _details.length > 0; i++) {
            if (_details[i].detail === 'Email Address') {
                return _details[i];
            }
        }
        return null;
    }

    sendMail(mailOptions, callback) {
        var options = {
            auth: {
                api_user: process.env.SENDGRID_USER,
                api_key: process.env.SENDGRID_PASSWORD
            }
        }

        var transporter = nodemailer.createTransport(sgTransport(options));
        // setup e-mail data with unicode symbols
        mailOptions.from = 'rathodgirishk@gmail.com';

        // console.log(' mailOptions' + JSON.stringify(mailOptions));
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info) {
            console.log('************ function error ' + JSON.stringify(error));
            console.log('************ function info ' + JSON.stringify(info));
            if (error) {
                callback(error, null);
                // return console.log(error);
            } else {

                callback(null, 'Message sent: ' + info.response);
            }
        });
    }



    updateRecurringEmailAutomation(emailTask) {
        var sendDate = moment(emailTask.sendDate).add('years', 1).format("YYYY-MM-DD");
        var emailAutomationObject = {
            nextDate: moment(emailTask.nextDate).add('years', 1).format("YYYY-MM-DD"),
            templateId: emailTask.templateId,
            sendDate: sendDate,
            sendTime: emailTask.sendTime,
            placeholders: emailTask.placeholders,
            workspaceExtensionId: emailTask.workspaceExtensionId,
            clientId: emailTask.clientId,
            status: emailTask.status,
            recurrenceFrequency: emailTask.recurrenceFrequency
        };
        var id = emailTask.id;
        var query = {
            $set: emailAutomationObject
        };
        EMAIL_AUTOMATION_COLLECTION.find({ _id: new ObjectID(id) }, function(emailAutomationerror, getEmailAutomation) {
            if (emailAutomationerror || !getEmailAutomation) {
                console.log('EmailAutomation not exists!');
            } else {
                EMAIL_AUTOMATION_COLLECTION.update({ _id: new ObjectID(id) }, query, function(error, result) {
                    if (error) {
                        console.log('Error in updating Email Automation!');
                    } else {
                        console.log('Email Automation updated successfully.')
                    }
                });
            }
        });
    }

    addEmailAutomationHistory(emailAutomationHistoryObject) {
        if (COMMON_ROUTE.isUndefinedOrNull(emailAutomationHistoryObject.templateId) || COMMON_ROUTE.isUndefinedOrNull(emailAutomationHistoryObject.sendDate)) {
            console.log('Required fields are missing!');

        } else {
            var emailAutomationHistory = new EMAIL_AUTOMATION_COLLECTION_HISTORY(emailAutomationHistoryObject);
            emailAutomationHistory.save(function(error, emailAutomationHistory) {
                if (error) {
                    console.log('Error in adding new emailAutomation!');
                } else {
                    console.log('New Email Automation History added successfully._id ' + emailAutomationHistory._id);
                }
            });
        }
    }
}

module.exports = new emailAutomation();