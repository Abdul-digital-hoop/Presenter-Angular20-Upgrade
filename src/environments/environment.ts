// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  Name: "LOCAL",
  MyApi: 'https://localhost:7216/api/v1/',
  AudienceApi: 'https://localhost:7217/api/v1/',
  SignalRDomain: 'https://localhost:7280/',
  PresenterDomain: 'http://localhost:4200/',
  AudienceDomain: 'http://localhost:4201/',
  AudienceURL:'localhost:4201',
  ImportAPI:'https://localhost:7051/api/v1/',
  PaymentGateway: 'razorpay', //stripe
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
