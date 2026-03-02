export default {
  providers: [
    {
      // Clerk JWT issuer — matches the frontend API domain from your
      // Clerk publishable key (pk_test_... decoded).
      domain: "https://pretty-piranha-77.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
