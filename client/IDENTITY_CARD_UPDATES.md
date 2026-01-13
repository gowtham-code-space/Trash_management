# Identity Card Component Updates

## Summary of Changes

The IdentityCard component has been completely refactored to use SVG files instead of hardcoded SVG calculations, and all card data is now dynamically populated from a JSON object.

## Key Changes Made

### 1. **SVG Assets Integration**
- **Removed**: Hardcoded SVG path calculations for front and back card designs
- **Added**: 
  - `front.svg` - Complete front card design from assets folder
  - `back.svg` - Complete back card design from assets folder
  - Both SVGs are imported and used as background images

```jsx
import frontSvg from "../../../assets/front.svg";
import backSvg from "../../../assets/back.svg";
```

### 2. **Dynamic Card Data Structure**
The `cardData` object now has a more structured format for easier customization:

```javascript
const cardData = {
    firstName: "JHON",              // First name (separate from last name)
    lastName: "SMITH",              // Last name (separate from first name)
    position: "Sanitary Inspector",
    idNo: "000234568",
    joinDate: "11/17/2024",
    phone: "+000 23 4568",
    profileImage: "https://...",    // Profile photo URL
    qrData: "FEEDBACK-749382-SESSION", // QR code data
    address: "123 Main Street..."   // Full address
};
```

### 3. **Front Card Changes**
- SVG background image replaces all hardcoded SVG calculations
- Content elements (logo, photo, name, details) are positioned as overlays
- Name is now displayed with separate `firstName` and `lastName` for better formatting:
  ```jsx
  <span className="text-[#37474F]">{cardData.firstName} </span>
  <span className="text-[#43A047]">{cardData.lastName}</span>
  ```

### 4. **Back Card Changes**
- SVG background replaces hardcoded background and wave elements
- TNLogo image is displayed using the existing `TNgovLogo` import
- QR Code is generated dynamically using the URL:
  ```jsx
  https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${cardData.qrData}
  ```

### 5. **Information Cards Section**
Updated to use the new data structure:
```jsx
`${cardData.firstName} ${cardData.lastName}`  // Concatenated full name
cardData.position
cardData.idNo
cardData.phone
```

## File Structure

```
src/
├── assets/
│   ├── front.svg          // New: Front card design
│   ├── back.svg           // New: Back card design
│   ├── TNgov.png          // Existing: Government logo
│   └── ...
└── pages/Common/IdentityCard/
    └── IdentityCard.jsx   // Updated component
```

## How to Use

### To Customize Card Data:
Simply modify the `cardData` object at the top of the component:

```javascript
const cardData = {
    firstName: "YOUR_FIRST_NAME",
    lastName: "YOUR_LAST_NAME",
    position: "YOUR_POSITION",
    idNo: "YOUR_ID",
    joinDate: "MM/DD/YYYY",
    phone: "+XXX XX XXXX",
    profileImage: "https://your-image-url.jpg",
    qrData: "YOUR_QR_DATA",
    address: "Your full address here"
};
```

### To Make It Fully Dynamic (Future Enhancement):
Accept props or fetch from API:
```javascript
export default function IdentityCard({ cardData: propData }) {
    const cardData = propData || defaultCardData;
    // Rest of component...
}
```

## Features Preserved
- ✅ 3D flip animation (Front to Back)
- ✅ Dark/Light theme support
- ✅ Dynamic QR code generation from data
- ✅ Responsive design
- ✅ Hover and active states
- ✅ Information cards section on the right

## Benefits of These Changes
1. **Cleaner Code**: Removed 400+ lines of SVG path calculations
2. **Better Maintainability**: Design changes only require updating SVG files
3. **Easier Customization**: All data in one JSON object
4. **Scalability**: Ready to accept props or API data
5. **Visual Accuracy**: Uses actual design SVGs instead of calculated paths
