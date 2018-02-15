'use strict';

module.exports = {
  db: 'mongodb://localhost/crm-development',
  staticUri: 'mongodb://localhost/static-data-development',
  app: {
    title: 'Automobi - API Base'
  },
  hubCentral: 'http://localhost:3333/api',
  brainAPI: 'http://localhost:8080/api',
  jwtAuth: '(quem-tem-medo-de-caga-NAOCOME$)!!',
  webSchedule: 'http://localhost:3000/webschedule/',
  apiMobile: 'http://localhost:3333/connect',
  sendGridKey: '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',
  // socketIO: 'http://localhost:5555', //** Use this when socket IO is running locally
  socketIO: 'https://staging.automobi.com.br',
  //SLA: 'https://staging.automobi.com.br/sla/'
  SLA: 'http://localhost:3344/',
  crmUrl: 'http://localhost:5000/#/',
  topicLane: "staging",
  mauticDB: {
    host: "mautic.czsyutzlexow.sa-east-1.rds.amazonaws.com",
    user: "admin",
    password: "(medoDEcaga!)",
    database: "mautic"
  },
  commercialEmailList: [
    {email: 'email', name: 'name'}
  ],
  developersEmailList: [
    {email: 'email', name: 'name'}
  ],
  csOperacaoEmailList: [
    {email: 'email', name: 'name'}
  ]
};
