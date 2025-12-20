import clientPromise from './mongo'

/**
 * Setup MongoDB indexes for optimal query performance
 * Run this script once after deployment or when adding new collections
 */
export async function setupIndexes() {
  console.log('🔧 Setting up MongoDB indexes...')

  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB)

  try {
    // Posts collection indexes
    console.log('  📝 Creating indexes for posts collection...')
    await db.collection('posts').createIndexes([
      { key: { createdAt: -1 }, name: 'posts_created_desc' },
      { key: { status: 1, createdAt: -1 }, name: 'posts_status_created' },
      { key: { platforms: 1 }, name: 'posts_platforms' },
      { key: { contentType: 1 }, name: 'posts_content_type' }
    ])

    // Admin users collection indexes
    console.log('  👤 Creating indexes for admin_users collection...')
    await db.collection('admin_users').createIndexes([
      { key: { email: 1 }, name: 'users_email_unique', unique: true },
      { key: { role: 1 }, name: 'users_role' }
    ])

    // Customers collection indexes
    console.log('  👥 Creating indexes for customers collection...')
    await db.collection('customers').createIndexes([
      { key: { name: 'text' }, name: 'customers_name_text' },
      { key: { phone: 1 }, name: 'customers_phone' },
      { key: { platform: 1 }, name: 'customers_platform' },
      { key: { tier: 1 }, name: 'customers_tier' },
      { key: { createdAt: -1 }, name: 'customers_created_desc' }
    ])

    // Products collection indexes
    console.log('  🐟 Creating indexes for products collection...')
    await db.collection('products').createIndexes([
      { key: { name: 'text' }, name: 'products_name_text' },
      { key: { categoryId: 1 }, name: 'products_category' },
      { key: { createdAt: -1 }, name: 'products_created_desc' }
    ])

    // Categories collection indexes
    console.log('  📂 Creating indexes for categories collection...')
    await db.collection('categories').createIndexes([
      { key: { name: 1 }, name: 'categories_name' }
    ])

    // Orders collection indexes
    console.log('  🛒 Creating indexes for orders collection...')
    await db.collection('orders').createIndexes([
      { key: { status: 1, createdAt: -1 }, name: 'orders_status_created' },
      { key: { customerId: 1 }, name: 'orders_customer' },
      { key: { createdAt: -1 }, name: 'orders_created_desc' },
      { key: { paymentStatus: 1 }, name: 'orders_payment_status' }
    ])

    // Banners collection indexes
    console.log('  🎨 Creating indexes for banners collection...')
    await db.collection('banners').createIndexes([
      { key: { createdAt: -1 }, name: 'banners_created_desc' }
    ])

    // Campaigns collection indexes
    console.log('  📢 Creating indexes for campaigns collection...')
    await db.collection('campaigns').createIndexes([
      { key: { status: 1 }, name: 'campaigns_status' },
      { key: { platform: 1 }, name: 'campaigns_platform' },
      { key: { createdAt: -1 }, name: 'campaigns_created_desc' }
    ])

    // Social auth connections indexes
    console.log('  🔗 Creating indexes for social_auth collection...')
    try {
      await db.collection('social_auth').createIndexes([
        { key: { userId: 1, platform: 1 }, name: 'social_auth_user_platform', unique: true },
        { key: { platform: 1 }, name: 'social_auth_platform' },
        { key: { createdAt: -1 }, name: 'social_auth_created_desc' }
      ])
    } catch (error: any) {
      if (error.code === 11000) {
        console.warn('  ⚠️  Warning: Duplicate data found in social_auth collection.')
        console.warn('  ⚠️  Creating non-unique indexes instead...')
        await db.collection('social_auth').createIndexes([
          { key: { userId: 1, platform: 1 }, name: 'social_auth_user_platform_non_unique' },
          { key: { platform: 1 }, name: 'social_auth_platform' },
          { key: { createdAt: -1 }, name: 'social_auth_created_desc' }
        ])
      } else {
        throw error
      }
    }

    console.log('✅ All indexes created successfully!')
  } catch (error) {
    console.error('❌ Error creating indexes:', error)
    throw error
  }
}

/**
 * Drop all indexes (useful for recreating indexes)
 * WARNING: This will drop all indexes except _id
 */
export async function dropAllIndexes() {
  console.log('🗑️  Dropping all indexes...')

  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB)

  const collections = [
    'posts',
    'admin_users',
    'customers',
    'products',
    'categories',
    'orders',
    'banners',
    'campaigns',
    'social_auth'
  ]

  for (const collectionName of collections) {
    try {
      console.log(`  Dropping indexes for ${collectionName}...`)
      await db.collection(collectionName).dropIndexes()
    } catch (error) {
      console.warn(`  Warning: Could not drop indexes for ${collectionName}:`, error)
    }
  }

  console.log('✅ All indexes dropped!')
}

// CLI execution (ES modules compatible)
const isMainModule = import.meta.url === `file://${process.argv[1]}`

if (isMainModule) {
  const command = process.argv[2]

  if (command === 'setup') {
    setupIndexes()
      .then(() => {
        console.log('Done!')
        process.exit(0)
      })
      .catch((error) => {
        console.error('Failed:', error)
        process.exit(1)
      })
  } else if (command === 'drop') {
    dropAllIndexes()
      .then(() => {
        console.log('Done!')
        process.exit(0)
      })
      .catch((error) => {
        console.error('Failed:', error)
        process.exit(1)
      })
  } else {
    console.log('Usage: tsx infrastructure/db/setup-indexes.ts [setup|drop]')
    process.exit(1)
  }
}
