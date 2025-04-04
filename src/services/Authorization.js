export function CreateAccount() {
  async function signUpNewUser() {
    const { data, error } = await supabase.auth.signUp({
      email: "valid.email@supabase.io",
      password: "example-password",
    });
  }
}
