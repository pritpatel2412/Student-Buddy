# How to Test "Student Buddy"

## Step 1: detailed Loading into Chrome
1. Open **Google Chrome**.
2. In the address bar, type `chrome://extensions` and press Enter.
3. In the top-right corner, make sure the **Developer mode** toggle is **ON** (Blue).
4. Click the **Load unpacked** button (top-left).
5. File Explorer will open. Select this folder:
   `C:\Users\Dell\OneDrive\Desktop\CX`
6. You should now see "Student Buddy - AI DSA Mentor" validation card in the list.

## Step 2: Testing the Extension
1. **Open a DSA Problem**:
   - Navigate to [LeetCode: Two Sum](https://leetcode.com/problems/two-sum/) (or any other problem).
2. **Open the Side Panel**:
   - Look for the **Puzzle Piece** icon (Extensions) in your Chrome Toolbar (top-right).
   - Click "Student Buddy".
   - *Tip: Pin it 📌 for easy access.*
   - If it doesn't open the side panel immediately, right-click the extension icon and select "Open Side Panel".
3. **Verify Context**:
   - Look at the top of the Side Panel. The **Context Pill** should show: `LeetCode: Two Sum`.
   - If it says "Detecting..." or "No problem found", click the small **Refresh Icon** inside the pill.
4. **Chat**:
   - Type "Help me solve this" or "Give me a hint".
   - You should see a "Thinking..." animation, followed by a response from the AI.

## Troubleshooting
- **"Error: API Key is missing"**: Check `constants.js` and ensure you saved the file with your key.
- **"Connection Error"**: Check if your internet is active and the API key is valid.
- **Changes not showing?**: If you edit the code, go back to `chrome://extensions` and click the **Refresh (circular arrow)** icon on the Student Buddy card, then refresh the LeetCode page.
