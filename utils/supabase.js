import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'
import { Platform } from 'react-native'

const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseKey = Constants.expoConfig?.extra?.SUPABASE_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables are not defined. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY.')
}

const authOptions = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: false,
}

if (Platform.OS !== 'web') {
  authOptions.storage = AsyncStorage
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || '',
  {
    auth: authOptions,
  }
)