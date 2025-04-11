import { supabase } from '../supabaseConfig';

export const requireAuth = async (navigate, targetPath) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Trigger Google OAuth login
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${targetPath}`
      }
    });
    return false;
  }
  
  return user;  // Return the user object if authenticated
}; 