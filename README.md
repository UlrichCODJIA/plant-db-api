# Plant Information Database API

This is a RESTful API for managing plant information in a database. It provides endpoints for creating, reading, updating, and deleting plant records, as well as user authentication and authorization.

## Features

- CRUD operations for plant records
- User registration and login
- Role-based authentication and authorization
- Advanced search and filtering options
- Pagination and sorting
- Caching for improved performance
- Integration with AWS S3 for image uploads
- Logging and error handling
- Input validation and sanitization
- Rate limiting and security measures

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens (JWT) for authentication
- bcrypt for password hashing
- Redis for caching
- Winston for logging
- AWS S3 for image storage
- Jest and Supertest for testing

## Getting Started

1. Clone the repository:
   `git clone https://github.com/your-username/plant-db-api.git`

2. Install the dependencies:

   ```shell
   cd plant-db-api
   npm install
   ```

3. Set up the environment variables:

   - Create a `.env` file in the root directory.
   - Define the following variables:

   ```shell
   MONGODB_URI=your-mongodb-uri
   JWT_SECRET=your-jwt-secret
   AWS_ACCESS_KEY_ID=your-aws-access-key-id
   AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
   AWS_REGION=your-aws-region
   AWS_BUCKET_NAME=your-aws-bucket-name
   ```

4. Start the server:
   `npm start`

5. The API will be accessible at `http://localhost:3000/api`.

## API Endpoints

- `POST /api/register` - Register a new user
- `POST /api/login` - Login a user and obtain a token
- `GET /api/plants` - Get plants with pagination, search, and filtering
- `GET /api/plants/:id` - Get a single plant by ID
- `POST /api/plants/cms` - Create a new plant (CMS only)
- `PUT /api/plants/cms/:id` - Update a plant (CMS only)
- `DELETE /api/plants/cms/:id` - Delete a plant (CMS only)
- `GET /api/plants/sync` - Get plants updated after a specific timestamp

## Testing

To run the tests, use the following command:
`npm test`

## Linting

To lint the code using ESLint, use the following command:
`npm run lint`

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvement, please create an issue or submit a pull request.

## License

This project is licensed under the MIT License.
