
---

# Survey Creator

A web application that allows users to create surveys and submit their responses. Built with SvelteKit for the frontend, Node Express for the backend, PostgreSQL for the database, Sanity CMS for content management, and styled with Tailwind CSS.

---

## Features

- **Survey Creation**: Admins can create custom surveys with multiple question types.
- **User Responses**: Users can fill out surveys and submit their answers.
- **Content Management**: Content (e.g., survey questions, options) is managed via Sanity CMS.
- **Responsive UI**: The frontend is designed using Tailwind CSS for a mobile-friendly interface.

---

## Tech Stack

- **Frontend**: SvelteKit, Tailwind CSS
- **Backend**: Node.js (Express)
- **Database**: PostgreSQL
- **CMS**: Sanity CMS

---

## Prerequisites

Before getting started, make sure you have the following installed:

- [Node.js](https://nodejs.org/en/) (Version 20.0.0 or higher)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Sanity CLI](https://www.sanity.io/docs/cli) (for interacting with Sanity CMS)

---

## Getting Started

### 1. Clone the Repository

Clone the project to your local machine:

```bash
git clone (https://github.com/edasa235/survey1.git)
cd survey-creator
```

### 2. Install Dependencies

Install the dependencies for both the frontend and backend:

- **Frontend (SvelteKit)**:

  ```bash
  cd frontend
  npm install
  ```

- **Backend (Node Express)**:

  ```bash
  cd backend
  npm install
  ```

### 3. Set Up Environment Variables

Create `.env` files in both the frontend and backend directories. You will need to configure the following environment variables:

- **Frontend** (in `frontend/.env`):

  ```env
  VITE_API_URL=http://localhost:5000
  ```

- **Backend** (in `backend/.env`):

  ```env
  PGHOST=localhost
  PGUSER=your_db_user
  PGPASSWORD=your_db_password
  PGDATABASE=your_db_name
  PGPORT=5432  
  SANITY_PROJECT_ID=your_sanity_project_id
  SANITY_DATASET=your_sanity_dataset
  SANITY_TOKEN = sanity_token
  ```
*to get sanity token go to api token under api
If you're using a cloud database, replace the local database values with your cloud database credentials.

### 4. Set Up the Database

You can use PostgreSQL locally by running the following commands if you don’t already have a PostgreSQL instance:

```bash
docker run --name postgres -e POSTGRES_USER=your_db_user -e POSTGRES_PASSWORD=your_db_password -e POSTGRES_DB=your_db_name -p 5432:5432 -d postgres
```

Or, if you're using an existing PostgreSQL or cloud database, ensure the credentials match the values in your `.env` file.

### 5. Sanity CMS Setup

1. Install and configure Sanity CMS by following the [Sanity setup guide](https://www.sanity.io/docs/getting-started).
2. Create a schema for your surveys (questions, options) in Sanity and deploy it.
3. Add your Sanity Project ID and Dataset to the backend `.env` file.

### 6. Run the Application Locally

Now you’re ready to run both the backend and frontend locally.

- **Start the backend server**:

  In the `backend` folder, run:

  ```bash
  npm run dev
  ```

  This starts the backend API on `http://localhost:5000`.

- **Start the frontend server**:

  In the `frontend` folder, run:

  ```bash
  npm run dev
  ```

  This starts the frontend UI on `http://localhost:3000`.

---

## Usage

- **Admin Dashboard**: Admins can log in to create new surveys, manage existing surveys, and view responses.
- **Survey Page**: Users can navigate to the survey link, fill out the survey, and submit their responses.

---

## Deployment

To deploy the project to the cloud, you can use services like **Vercel** for the frontend and **Render** or **Heroku** for the backend and PostgreSQL database.

### Deploying the Frontend on Vercel:

1. Push the `frontend` folder to a GitHub repository.
2. Connect the GitHub repository to Vercel.
3. Set the `VITE_API_URL` environment variable in the Vercel dashboard to point to the backend API URL.
4. create a cloud hosted sql on nano

### Deploying the Backend on Render/Heroku:

1. Push the `backend` folder to a GitHub repository.
2. Connect the GitHub repository to Render/Heroku.
3. Set the appropriate environment variables for the database and Sanity in the cloud platform’s dashboard.

---

## License

open source

---


