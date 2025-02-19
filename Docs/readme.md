**Guide to Using the Barcode Scanner Website**

---

### Overview

The Barcode Scanner website is a powerful tool for managing stock receipt and stock count processes efficiently. This guide provides a detailed walkthrough of how to set up and use the scanner effectively, including scanning workflows, managing mappings, and exporting data for Sage X3.

---

### Setting Up a Scanning Session

Before you begin scanning, set up the session as follows:

1. **Select the Scan Type**: Choose between **Stock Receipt** or **Stock Count**.
2. **Select the Storage Site**.
3. **Choose the Movement Code**.
4. **Input the Location**.
5. **Activate REF Input Mode?**: Enable this option if not all references (REFs) are known beforehand.

> **Note**: You can update the session setup at any time during the process by clicking on **“Change Setup”**. Changes will apply to subsequent scanned products.

---

### Starting the Scanning Process

1. Click on **Start Scanning**.
2. **Prepare to Scan**:
   - Focus the mouse cursor on the input field.
   - Use the scanner to scan a barcode.
3. **Handle the Scanned Data**:
   - A new row will appear in the table.
   - If no REF is associated with the barcode’s GTIN, input it manually.
   - If a REF is already mapped, the focus will automatically skip the REF column.
4. **Input Quantity**:
   - Enter the quantity for products with the same barcode (not just the same REF).
   - After inputting the quantity, the focus will automatically return to the scanner input field.
5. Repeat the process for additional products.

#### If the Product Has No GS1 Barcode or a Segmented Barcode

- Click on **Manual Entry**.
- A new screen will appear where you can input the product’s details.
- Click **Add** to confirm, or **Cancel** (or the cross icon) to discard.

---

### Modifying Scanned Product Information

1. To modify a scanned product:

   - Click on the **blue pen icon** at the end of the row you want to edit.
   - A new screen will appear where you can update the product details.
   - Click **Save Changes** to confirm or **Cancel** (or the cross icon) to discard changes.

2. To delete a row:
   - Click on the **red bin icon** at the end of the row you want to delete.
   - A confirmation screen will appear.
   - Click **Delete** to confirm or **Cancel** to discard.

---

### Finalizing the Scanning Session

1. Review the table to ensure all information is complete and accurate.
2. Click **Export CSV**:
   - A CSV file will be generated and saved in your browser’s download folder.
   - Use this file to update Sage X3 accordingly.
3. To start a new session:
   - Click **Clear All**.
   - Update the setup if needed.

---

### Managing GTIN-REF Mappings

A mapping between REF and GTIN is automatically created each time you scan a product and add a REF. For future scans of the same product, the REF will auto-fill after scanning.

1. **Access Mappings**:

   - Click on **Manage Mappings** to open the GTIN-REF Mappings screen.

2. **Features on the GTIN-REF Mappings Screen**:
   - View the GTIN-REF table.
   - Import mappings.
   - Export mappings.
   - Add manual mappings.
   - Edit or delete mappings.

#### Exporting Mappings

- To back up mappings or transfer them to another PC/browser:
  1. Click **Export Mapping**.
  2. A CSV file will be generated and saved in your browser’s download folder.

#### Importing Mappings

- To import mappings after switching PCs/browsers:
  1. Click **Import Mapping**.
  2. Select the exported CSV file.
  3. **Important**: Ensure the file contains the latest mappings to avoid inconsistencies.

#### Editing and Deleting Mappings

- **Edit a Value**: Double-click on the value you want to modify.
- **Delete a Row**: Click on the **red bin icon** next to the row you want to remove.
- **Save Changes**: Always click **Save** after making edits to ensure data is updated.

---

### Key Notes

- **Backup Your Mappings**: Regularly export mappings to avoid data loss and ensure a seamless transition between devices.
- **Handle Manual Entries Carefully**: Use the manual entry feature for products without barcodes to ensure they are included in the scan data.
- **Double-Check Exported Files**: Verify the exported CSV file before using it in Sage X3.

---

### Troubleshooting

#### The scanner isn’t detecting a barcode:

- Ensure the scanner is connected and functioning correctly.
- Verify that the barcode is not damaged or poorly printed.
- Adjust lighting conditions for better scanning accuracy.

#### Mappings are not syncing:

- Check if the correct mapping file is imported.
- Ensure the mapping file is the latest version.

---

### Example Workflow

1. **Setup the Session**: Select scan type, storage site, movement code, and location.
2. **Start Scanning**: Scan barcodes and input necessary details (REF and quantity).
3. **Export Data**: Save the session as a CSV file and use it in Sage X3.
4. **Manage Mappings**: Regularly update and export mappings to maintain consistency.

---

If you have questions or need further assistance, contact Gérald Waerseggers at **geraldwae@gmail.com**.
