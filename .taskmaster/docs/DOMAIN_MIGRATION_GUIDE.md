# Domain Entity Migration Guide

This guide explains the changes made to domain entities and how to migrate existing code.

## Overview of Changes

### 1. Posts Module Enhancement
- Added multi-platform support (Facebook, TikTok, Zalo, YouTube)
- Added content types (post, feed, reel, short, video, story)
- Added platform-specific metadata and metrics
- Added scheduling capabilities
- Added media attachments support

### 2. Customer + Order Unification
- Enhanced Customer entity with multi-platform identifiers
- Added customer statistics and tier management
- Updated Order entity to use `customerId` instead of `zaloUserId`
- Added comprehensive payment and delivery tracking

### 3. S3 Upload Integration
- Added S3 storage service
- Created reusable ImageUpload component
- Added file upload API endpoints

---

## 1. Posts Module Migration

### Old Post Entity
```typescript
export class Post {
  constructor(
    public readonly id: string,
    public title: string,
    public body: string | undefined,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}
}
```

### New Post Entity
```typescript
export class Post {
  constructor(
    public readonly id: string,
    public title: string,
    public body: string | undefined,
    public contentType: ContentType,
    public platforms: PlatformMetadata[],
    public media: PostMedia[],
    public scheduledAt: Date | undefined,
    public hashtags: string[],
    public mentions: string[],
    public campaignId: string | undefined,
    public metrics: PostMetrics,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}
}
```

### Migration Steps

#### Step 1: Update Repository `toDomain` Method

**Before:**
```typescript
protected toDomain(doc: any): Post {
  const { _id, ...postData } = doc;
  return new Post(
    _id.toString(),
    postData.title,
    postData.body,
    postData.createdAt,
    postData.updatedAt
  );
}
```

**After:**
```typescript
protected toDomain(doc: any): Post {
  const { _id, ...postData } = doc;
  return new Post(
    _id.toString(),
    postData.title,
    postData.body,
    postData.contentType || "post",
    postData.platforms || [],
    postData.media || [],
    postData.scheduledAt,
    postData.hashtags || [],
    postData.mentions || [],
    postData.campaignId,
    postData.metrics || {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      reach: 0,
      engagement: 0
    },
    postData.createdAt,
    postData.updatedAt
  );
}
```

#### Step 2: Update Use Cases

Add validation for new fields:

```typescript
import { validatePost } from "@/core/domain/post";

export class CreatePostUseCase {
  async execute(request: CreatePostRequest): Promise<CreatePostResponse> {
    // Validate
    const errors = validatePost(request);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }

    const post = await this.postService.create(request);
    return { post };
  }
}
```

#### Step 3: Update UI Forms

Add new fields to the post form:

```tsx
// app/(features)/posts/components/PostForm.tsx
import { Platform, ContentType } from "@/core/domain/post";

export function PostForm() {
  const [contentType, setContentType] = useState<ContentType>("post");
  const [platforms, setPlatforms] = useState<Platform[]>(["facebook"]);
  const [hashtags, setHashtags] = useState<string[]>([]);

  return (
    <form>
      {/* Content Type */}
      <select value={contentType} onChange={(e) => setContentType(e.target.value as ContentType)}>
        <option value="post">Post</option>
        <option value="reel">Reel</option>
        <option value="short">Short</option>
        <option value="video">Video</option>
      </select>

      {/* Platform Selection */}
      {["facebook", "tiktok", "zalo", "youtube"].map(platform => (
        <Checkbox
          key={platform}
          checked={platforms.includes(platform as Platform)}
          onCheckedChange={(checked) => {
            if (checked) {
              setPlatforms([...platforms, platform as Platform]);
            } else {
              setPlatforms(platforms.filter(p => p !== platform));
            }
          }}
        >
          {platform}
        </Checkbox>
      ))}

      {/* Hashtags */}
      <TagInput
        value={hashtags}
        onChange={setHashtags}
        placeholder="Add hashtags..."
      />
    </form>
  );
}
```

---

## 2. Customer + Order Unification Migration

### Old Customer Entity
```typescript
export type Customer = {
  id: string;
  name?: string;
  foundation: string; // Zalo, facebook, telegram
  // ...
}
```

### New Customer Entity
```typescript
export type Customer = {
  id: string;
  name?: string;
  platformIds: CustomerPlatformId[];
  primarySource: CustomerSource;
  tier: CustomerTier;
  status: CustomerStatus;
  stats: CustomerStats;
  tags: string[];
  // ...
}
```

### Migration Steps

#### Step 1: Update Customer Repository

**Database Migration Script:**

```javascript
// scripts/migrate-customers.js
db.customers.find().forEach(function(customer) {
  db.customers.updateOne(
    { _id: customer._id },
    {
      $set: {
        platformIds: [
          {
            platform: customer.foundation || "other",
            platformUserId: customer.id
          }
        ],
        primarySource: customer.foundation || "other",
        tier: "new",
        status: "active",
        tags: [],
        stats: {
          totalOrders: 0,
          totalSpent: 0,
          averageOrderValue: 0
        }
      },
      $unset: {
        foundation: ""
      }
    }
  );
});
```

#### Step 2: Update Customer Repository `toDomain`

```typescript
protected toDomain(doc: any): Customer {
  return {
    id: doc._id.toString(),
    name: doc.name,
    avatar: doc.avatar,
    phone: doc.phone,
    email: doc.email,
    platformIds: doc.platformIds || [],
    primarySource: doc.primarySource || "other",
    address: doc.address,
    tier: doc.tier || "new",
    status: doc.status || "active",
    tags: doc.tags || [],
    stats: doc.stats || {
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0
    },
    notes: doc.notes,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
```

### Old Order Entity
```typescript
export class Order {
  constructor(
    public readonly id: number,
    public zaloUserId: string,
    public checkoutSdkOrderId: string | undefined,
    // ...
  ) {}
}
```

### New Order Entity
```typescript
export class Order {
  constructor(
    public readonly id: number,
    public customerId: string,
    public platformOrderId?: string,
    public platformSource?: string,
    // Enhanced fields...
  ) {}
}
```

#### Step 3: Update Order Repository

**Database Migration Script:**

```javascript
// scripts/migrate-orders.js
db.orders.find().forEach(function(order) {
  // Find customer by zaloUserId
  const customer = db.customers.findOne({
    "platformIds.platformUserId": order.zaloUserId,
    "platformIds.platform": "zalo"
  });

  if (customer) {
    db.orders.updateOne(
      { _id: order._id },
      {
        $set: {
          customerId: customer._id.toString(),
          platformOrderId: order.checkoutSdkOrderId,
          platformSource: "zalo",
          subtotal: order.total,
          shippingFee: 0,
          discount: 0,
          payment: {
            method: "cod",
            status: order.paymentStatus,
            amount: order.total
          },
          tags: []
        },
        $unset: {
          zaloUserId: "",
          checkoutSdkOrderId: ""
        }
      }
    );
  }
});
```

#### Step 4: Update Order Repository `toDomain`

```typescript
protected toDomain(doc: any): Order {
  return new Order(
    doc._id,
    doc.customerId,
    doc.platformOrderId,
    doc.platformSource,
    doc.status,
    doc.items,
    doc.delivery,
    doc.subtotal,
    doc.shippingFee || 0,
    doc.discount || 0,
    doc.total,
    doc.payment,
    doc.note,
    doc.internalNotes,
    doc.tags || [],
    doc.createdAt,
    doc.updatedAt,
    doc.confirmedAt,
    doc.completedAt,
    doc.cancelledAt
  );
}
```

#### Step 5: Update Use Cases

**Finding Customer by Platform User ID:**

```typescript
// Before
const customer = await customerRepo.getById(zaloUserId);

// After
import { getCustomerPlatformId } from "@/core/domain/customer";

// Option 1: If you have platform user ID
const customer = await customerRepo.findByPlatformUserId("zalo", zaloUserId);

// Option 2: If you have customer, get platform user ID
const zaloUserId = getCustomerPlatformId(customer, "zalo");
```

---

## 3. Testing Migrations

### Test Customer Migration

```typescript
import { describe, it, expect } from "vitest";
import { validateCustomer } from "@/core/domain/customer";

describe("Customer Migration", () => {
  it("should validate new customer structure", () => {
    const customer = {
      id: "123",
      platformIds: [
        { platform: "zalo", platformUserId: "zalo123" }
      ],
      primarySource: "zalo",
      tier: "new",
      status: "active",
      tags: [],
      stats: {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0
      }
    };

    const errors = validateCustomer(customer);
    expect(errors).toHaveLength(0);
  });
});
```

### Test Order Migration

```typescript
import { describe, it, expect } from "vitest";
import { validateOrder, calculateOrderTotal } from "@/core/domain/order";

describe("Order Migration", () => {
  it("should validate new order structure", () => {
    const order = {
      customerId: "customer123",
      items: [
        {
          productId: "prod1",
          productName: "Product 1",
          quantity: 2,
          unitPrice: 100,
          totalPrice: 200
        }
      ],
      delivery: {
        name: "John Doe",
        phone: "0123456789",
        address: "123 Street"
      },
      subtotal: 200,
      shippingFee: 30,
      discount: 0,
      total: 230,
      payment: {
        method: "cod",
        status: "pending",
        amount: 230
      }
    };

    const errors = validateOrder(order);
    expect(errors).toHaveLength(0);

    const total = calculateOrderTotal(order.items, 30, 0);
    expect(total).toBe(230);
  });
});
```

---

## Rollback Plan

If you need to rollback:

1. **Restore database backup**
2. **Revert domain entity files**
3. **Revert repository files**
4. **Restart application**

---

## Support

For questions or issues during migration:
- Check error logs in MongoDB
- Review validation errors in use cases
- Test thoroughly in development before production
- Keep database backups before migration
