import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Load environment variables from .env.test
config({ path: '.env.test' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// Test the connection
async function testConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return
    }
    
    console.log('✅ Connection successful!')
    console.log('Data:', data)
  } catch (err) {
    console.error('❌ Error:', err)
  }
}

// Run the test
testConnection() 