Follow these steps:

# Step 1: Install the necessary dependencies.
npm i

# Step 2: Start the development server with auto-reloading and an instant preview.
npm run dev

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

# Login & Registration Page  
- **Uses Bootstrap CSS**  
- **Left Side:** Contains descriptive text  
- **Right Side:** "Log in to your account" section  
- **Features:**  
  - Email & password (password stored as a hash)  
  - "Remember Me" (saves email & password in local storage)  
  - "Forgot Password" (resets via email)  
  - Registration:  
    - "Sign up here" option  
    - Social sign-in (Google, Facebook, etc.)  
  - User details persist using local storage  

---  
# Workflow Page  
- **Hamburger Icon:** Changes color on click  
- **Search Box:** Filters workflows  
- **"Create New Process" Button:** Opens Process Page  

### Workflow List  
Each workflow displays:  
- Name, ID, Last Edited (Format: `{Author Name} | {hh:mm} IST {dd/mm}`)  
- Description, Tag Icon  
- **Actions:**  
  - **Execute:** Confirmation dialog with a red warning message  
  - **Edit:** Opens the process page  
  - **Kebab Icon:** Opens "Delete" option → Confirmation dialog with a red warning  
  - **Downward Icon:** Expands details (pass/fail status with date & time)  

---  
# Process Page  
- **Navigation:**  
  - "Go Back" → Returns to Workflow Page  
  - "Save" → Opens dialog (enter name & description), saves to Workflow Page  
- **Controls:**  
  - "Start" & "Stop" buttons  
  - "+" Button → Adds API Call, Email, or Text Box (each with a delete option)  
  - Whiteboard-like UI (move, resize elements)  

### Element Details  
- **API Box (Double Click to Open Dialog):**  
  - Configuration: Method, URL, Headers, Body  
- **Email Box:** Email input field  
- **Text Box:** Message input field  

### Process Status  
- **Pass:** Both API & Email succeed  
- **Fail:** If either API or Email fails  
- **Downward Icon:** Shows pass/fail details with timestamps