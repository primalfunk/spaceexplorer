# Space Adventure Game

## Overview
Space Adventure is an interactive web-based game built using Phaser.js for the frontend and Flask for the backend. This game offers an immersive experience where players navigate a spaceship through a vast universe, dodging asteroids and experiencing the gravitational pull of stars.

## Features
- **Phaser.js Game Development**: Utilizes Phaser.js, a popular HTML5 game framework, for creating the main gameplay experience. Features include real-time spaceship control, collision detection, and particle effects for the spaceship trail.
- **Dynamic Collision and Physics**: Implements custom hitboxes for realistic collision handling between the spaceship and asteroids. Physics calculations for gravitational effects from different types of stars.
- **Procedural Generation**: The game dynamically generates stars and asteroids, each with unique properties, across the vast map.
- **Responsive Design**: The game is designed to be responsive and functional across various devices and screen sizes.
- **Flask Backend**: A lightweight Flask server handles backend processes, such as serving the game and potentially managing user data and scores in the future.

## Technologies Used
- **Phaser.js**: For game mechanics and rendering.
- **Flask**: Backend server for serving the game.
- **JavaScript and Python**: Primary programming languages used

## Setup and Installation
To set up the game locally, follow these steps:

1. Clone the repository:
```sh
   git clone [repository-url]
```
2. Navigate to the project directory:
```sh
    cd [project-directory]
```
3. Set up a virtual environment (optional but recommended):
```sh
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
```
4. Install the required Python packages:
```sh
    pip install -r requirements.txt
```
5. Run the Flask application:
```sh
    flask run
```
The game should now be accessible at http://localhost:5000.

## Project Structure
- /static: Contains static files like images, JavaScript, and CSS.
- /templates: Flask templates for rendering the HTML.
- app.py: The Flask application.
- game.js: Main JavaScript file for Phaser game logic.