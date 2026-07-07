# CS-372 Software Construction Group Project

Welcome to the SC Group Project repository. This project is a collaborative effort to build a robust movie management platform with features for content editing, marketing management, and user interaction. The platform is built using Node.js, MongoDB, and modern web technologies. As a final for our Junior Software Construction course.

## Authors

- **Spencer Baysinger** - Backend Development, Database Management
- **Ivy Swenson** - Frontend Development, UI/UX Design, API Integration

### Final Project Demo Video
[Watch the video](https://youtu.be/rvPUPhgZjw8)

## Project Structure
The project is organized as follows:  
```bash
SC-F372_SC/ ─── Assets/ # Static assets (posters, videos, etc.)  
            │ ├── banners/ # Folder containing all movie banners   
            │ │ └── {moviebanner.jpg} x6  
            │ |
            │ ├── posters/ # Folder containing all movie banners  
            │ │ └── {poster.webp} x30  
            │ |
            │ ├── videos/ # Folder containing all movie banners  
            │ │ └── {movie.mp4} x2  
            │ |
            │ ├── MovieList.json # .JSON file to import all movie data into empty 
            | |                  # MongoDB (Used on Content Editor page)  
            │ └── UmovieLogo.png # Logo for website 
            │ 
            ├── html/ # HTML files for the application 
            │ ├── index_Account.html 
            │ ├── index_ContentEditor.html 
            │ ├── index_Home.html 
            │ ├── index_Login.html 
            │ ├── index_MarketingManager.html 
            │ ├── terms.html 
            │ └── VideoPlayer.html 
            │ 
            ├── Javascript/ # Frontend and backend JavaScript files 
            │ ├── authController.js # API logic for authentication and movie management 
            │ ├── db.js # MongoDB connection logic 
            │ ├── script_Account.js 
            │ ├── script_ContentEditor.js 
            │ ├── script_General.js 
            │ ├── script_Home.js 
            │ ├── script_ImportMovies.js 
            │ ├── script_Login.js 
            │ ├── script_MarketingManager.js 
            │ └── script_VideoPlayer.js 
            │ 
            ├── node_modules/ # Node files for server 
            │ └── {tons of node.js dependency files} x4000+ 
            │ 
            ├── Styling/ # CSS files for styling the application 
            │ ├── ContentEditor.css 
            │ ├── HomeBanner.css 
            │ ├── HomePageStyle.css 
            │ ├── MarketingManager.css 
            │ ├── PlayerStyle.css 
            │ ├── PublicHeader.css 
            │ ├── ViewerHomePage.css 
            │ └── ViewerLoginStyle.css 
            │ 
            ├── package-lock.json # Node.js dependencies and scripts
            ├── package.json # Node.js dependencies and scripts
            ├── README.md # Project documentation 
            └── server.js # Main server file 
```

## Purpose and Functionality

The purpose of this project is to provide a platform for managing a movie database. The following users below each have a page available to help control the flow of media and data throughout the website.
- **Viewer**: Can watch and like/dislike movies, add them to their favorites, and leave comments/feedback to admins.
  - **Home**: This is where the main gallery of all the movies exists, signed in users can view, like, dislike, and favorite all their movies from this page.
  - **Account**: This is where signed in users can view their watch history, see their likes/dislikes/favorites, and leaves notes feedback for the marketing manager.
- **Content Editor**: This is where managers with elevated priviledgees can add and remove movies, edit movie details, 
- **Marketing Manager**: View movie statistics, user feedback, and manage notes to Content Editor.
- **Database Management**: Import movies from a `MovieList.json` file into MongoDB where movie and user information is stored.

## Getting Started

### Prerequisites
To run the following software, please be sure to have a 
  1) Working network connection.
  2) MongoDB and Node.JS installed.
  3) A working browser.

Follow these steps below to set up and run the project locally:

### 1. Clone the Repository
Clone and enter repository:
```bash
git clone https://github.com/your-username/SC-F372_F321_Group.git
cd SC-F372_F321_Group/SC-F372_SC
```

### 2. Install Dependencies
Ensure you have Node.js installed. Then, run:
```bash
npm install
```

### 3. Start MongoDB
Make sure MongoDB is installed and running on your system. Install/Run MongoDBCompass or start MongoDB with:
```bash
mongod
```

### 4. Start the Server
Be sure you are working in ```CS-F372_SC\``` and run the server using Node.js:
```bash
node server.js
```

### 5. Launch the Application
Open your browser and navigate to:
```bash
http://localhost:3000/
```

### 6. Import Movies
To import movies from MovieList.json:
- Sign in as a Content Editor.
- Navigate to the Content Editor page.
- Click the "Import MovieList.json" button.
- Ensure the MongoDB ```movies``` collection is empty before importing.

### 7. Test the Application
Create and test five types of users (No-Account), (Viewer), (Content Editor), (Marketing Manager), and (Content Editor and Marketing Manager).  

| Account | Restricted to | Features |
| --- | --- | --- |
| No-Account | Login Page | Can sign in or create account |
| Viewer | Login, Home, and Account Pages | Can view, like, dislike, favorite, remove favorite movies, and see such data on Account page |
| Content Editor | All But Marketing Manager Page | Add, edit, and remove movies, as well as import MovieList.json and view Marketing Manager notes |
| Marketing Manager | All But Content Editor Page | View statistics, feedback, and view and edit notes for Content Editor |
| Power User (CE & MM) | No restrictions | All above features are available |

## Acknowledgements
- The Team: Ivy Swenson and Spencer Baysinger for the collaborative effort in building this project.
- MongoDB: For providing a reliable NoSQL database solution.
- Node.js: For powering the backend server.
- The Testers: Grace, Jonathan, and Daniel for testing the product and raising issues.
- GitHub Copilot: Assistance with project structure and debugging.

## License
This project is licensed under the GNU General Public License (GPL). See the [LICENSE](LICENSE) file for details.

The GNU General Public License is a free, copyleft license for software and other kinds of works. For more information, visit [https://www.gnu.org/licenses/gpl-3.0.html](https://www.gnu.org/licenses/gpl-3.0.html).

---

Thank you for vising our Software Construction Class Group Final Project! If you encounter any issues or have suggestions, feel free to enjoy knowing you could improve the website. 💖
