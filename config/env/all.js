'use strict';

var fromName = 'Automobi Agendamento Web';
module.exports = {
  app: {
    title: 'Automobi - API Base'
  },
  dbOptions: {},
  port: process.env.PORT || 5000,
  firebaseKey: 'AIzaSyCQxDb2AC0CCSKZJf1Rv1bUESokbUO3iWE',
  hubCentral: 'http://dev.api.automobi.com.br:3333/api',
  sendGridKey: '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',
  brainAPI: 'http://localhost:8080/api',
  webSchedule: 'http://dev.crm.automobi.com.br/webschedule/',
  apiMobile: 'https://staging.automobi.com.br/api-mobile/connect',
  dirPath: '',
  socketIO: 'https://staging.automobi.com.br',
  apontadorApiUri: 'https://api.apontador.com.br/v2',
  apontadorAmClientSecret: 'CwF9GftGPmXzLvYYviMeafzuyLT~',
  apontadorAmClientId: 'automobi-schedulerequest',
  fromEmail: 'suporte@automobi.com.br',
  fromName: 'Suporte Automobi',
  jwtAuth: '(quem-tem-medo-de-caga-NAOCOME$)!!',
  subjectEmail: 'Novo agendamento Online via ' + fromName,
  templateEmail: '3dc310cd-76c4-4f78-9048-d6a87071fcca',
  templatePartsEmail: '523f6656-43ce-40c0-a14e-dcb30bd61982',
  templateToManagerEmailSchedule: '4d35d772-9f18-4f2c-a16b-94810c9b6b40',
  templateToManagerEmailScheduleRequest: '8bae580e-c7e2-45d3-ad97-2627869b75f5',
  templateSurvey: "a4fa3a44-9804-453f-b158-b98183e65bf1",
  emailReceiveSchedule: 'cs@automobi.com.br',
  nameReceiveSchedule: 'Ana Farias'
};
