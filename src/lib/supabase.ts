import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Save profile to Supabase
export async function saveProfileToSupabase(profile: any) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error('Auth error in saveProfileToSupabase:', userError);
    return null;
  }
  
  if (!user) {
    console.log('No user logged in - skipping save to Supabase');
    return null;
  }
  
  console.log('=== SAVING TO SUPABASE ===');
  console.log('User ID:', user.id);
  console.log('Email being saved:', profile.email);
  console.log('Instruments array length:', profile.instruments?.length);
  console.log('Instruments content:', JSON.stringify(profile.instruments));
  console.log('SingingWhilePlaying:', profile.singingWhilePlaying);
  
  // Ensure instruments is an array
  const instrumentsToSave = profile.instruments || [];
  
  const updateData: Record<string, unknown> = {
    id: user.id,
    full_name: profile.name,
    email: profile.email || '',
    daily_practice_minutes: profile.dailyPracticeGoal,
    instruments: instrumentsToSave,
    singing_while_playing: profile.singingWhilePlaying || false,
    focus_areas: profile.focusAreas || [],
    updated_at: new Date().toISOString()
  };
  
  // Add bio if exists
  if (profile.bio) {
    updateData.bio = profile.bio;
  }
  
  // Add avatar if exists
  if (profile.avatar) {
    updateData.avatar_url = profile.avatar;
  }
  
  // Set primary instrument info for backward compatibility
  const primaryInstrument = profile.instruments?.find((i: any) => i.isPrimary === true);
  if (primaryInstrument) {
    updateData.selected_instrument = primaryInstrument.name;
    updateData.grade_level = primaryInstrument.gradeLevel;
    updateData.syllabus = primaryInstrument.syllabus;
    updateData.genre = primaryInstrument.genre;
  }
  
  console.log('Data being sent to Supabase:', JSON.stringify(updateData, null, 2));
  
  const { data, error } = await supabase
    .from('profiles')
    .upsert(updateData)
    .select();
    
  if (error) {
    console.error('❌ Save profile error:', error);
  } else {
    console.log('✅ Profile saved successfully to Supabase:', data);
  }
  
  return data;
}

// Load profile from Supabase
export async function loadProfileFromSupabase() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error('Auth error in loadProfileFromSupabase:', userError);
    return null;
  }
  
  if (!user) {
    console.log('No user logged in - skipping load from Supabase');
    return null;
  }
  
  console.log('=== LOADING FROM SUPABASE ===');
  console.log('User ID:', user.id);
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      console.log('No profile found for user - will create on first save');
    } else {
      console.error('Load profile error:', error);
    }
  } else {
    console.log('✅ Profile loaded successfully from Supabase');
    console.log('Loaded email:', data?.email);
    console.log('Loaded instruments:', data?.instruments);
    console.log('Loaded singing_while_playing:', data?.singing_while_playing);
  }
  
  return data;
}