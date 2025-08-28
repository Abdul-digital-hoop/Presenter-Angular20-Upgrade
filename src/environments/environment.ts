// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  Name: "LOCAL",
  MyApi: 'https://devpresapi.slidone.com/api/v1/',
    AudienceApi: 'https://devaudiapi.slidone.com/api/v1/',
    SignalRDomain: 'https://devsocket.slidone.com/',
    PresenterDomain: 'https://devpres.slidone.com/',
    AudienceDomain: 'https://devaudi.slidone.com/',
    AudienceURL:'devaudi.slidone.com',
    ImportAPI:'https://devimportapi.slidone.com/api/v1/',
    PaymentGateway: 'stripe',
    razorpayKey: 'rzp_test_tmjTFeXWgXsmjI',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
