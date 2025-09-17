# Bill Sharing Feature

## Overview
The Bill Sharing feature allows users to share their bills with other registered users in the eWallet application. This feature enables collaborative bill management and viewing while maintaining proper access controls.

## Features

### 1. **Share Bills with Other Users**
- Share bills by entering the recipient's email address
- Only registered users can receive shared bills
- Prevents sharing with oneself
- One-time sharing per user per bill (prevents duplicates)

### 2. **Shared Bills Management**
- View bills shared with you by other users
- View bills you've shared with others
- Revoke sharing permissions (for bill owners)
- Organized tabs for easy navigation

### 3. **Permission System**
- Currently supports "view" permission level
- Read-only access for shared bills
- Shared users cannot edit bills they don't own
- Future extensible to support "edit" permissions

### 4. **User Experience**
- Beautiful modal interface for sharing
- Animated components with Framer Motion
- Intuitive navigation in the app
- Toast notifications for actions

## API Endpoints

### Share a Bill
```
POST /api/shared-bills/bills/:billId/share
```
**Body:**
```json
{
  "sharedWithEmail": "user@example.com",
  "permissionLevel": "view" // optional, defaults to "view"
}
```

### Get Shared Bills
```
GET /api/shared-bills?type=shared_with_me
GET /api/shared-bills?type=shared_by_me
GET /api/shared-bills // returns both types
```

### Revoke Shared Bill
```
DELETE /api/shared-bills/:id
```

### Update Shared Bill Permissions
```
PUT /api/shared-bills/:id
```
**Body:**
```json
{
  "isActive": false,
  "permissionLevel": "view"
}
```

## Database Schema

### SharedBill Entity
- `id`: Primary key
- `bill_id`: Reference to the shared bill
- `owner_id`: User who owns the bill
- `shared_with_id`: User who receives the bill
- `permission_level`: Access level (default: "view")
- `is_active`: Whether sharing is active
- `shared_at`: When the bill was shared
- `created_at`, `updated_at`: Timestamps

## Frontend Components

### 1. **ShareBillModal**
- Located: `frontend/src/components/bills/ShareBillModal.tsx`
- Modal for sharing bills with other users
- Email validation and submission

### 2. **SharedBills Page**
- Located: `frontend/src/features/bills/SharedBills.tsx`
- Main page for viewing shared bills
- Tabbed interface for different sharing types

### 3. **Updated BillCard & BillList**
- Added share buttons to existing bill components
- Integrated sharing modals

## Navigation
- Added "Shared Bills" link to main navigation
- Accessible at `/shared-bills` route

## Security Features
- All endpoints require authentication
- Users can only share their own bills
- Users can only access shared bills they're authorized to view
- Email-based user lookup for sharing

## Future Enhancements
1. **Email Notifications**: Send email notifications when bills are shared
2. **Push Notifications**: Real-time in-app notifications
3. **Permission Levels**: Add "edit" permission for collaborative editing
4. **Share Links**: Generate temporary share links for external users
5. **Share History**: Track sharing activity and access logs
6. **Bulk Sharing**: Share multiple bills at once
7. **User Groups**: Create groups for easier sharing management

## Installation & Setup

1. **Database Migration**: Run the migration to create the `shared_bills` table:
   ```bash
   npm run migration:run
   ```

2. **Backend**: The shared bills routes are automatically included in the API

3. **Frontend**: The components are integrated into the existing app structure

## Usage

1. **To Share a Bill:**
   - Navigate to any bill (My Bills → View/Edit a bill)
   - Click the green "Share" button
   - Enter the recipient's email address
   - Click "Share Bill"

2. **To View Shared Bills:**
   - Navigate to "Shared Bills" in the main navigation
   - Switch between "Shared with Me" and "Shared by Me" tabs
   - Click "View" to see bill details
   - Use "Revoke" to stop sharing (for bills you own)

## Error Handling
- Graceful handling of non-existent users
- Prevention of duplicate sharing
- Proper error messages for invalid operations
- Fallback UI for loading states

This feature enhances the collaborative aspect of the eWallet application while maintaining security and user experience standards.
