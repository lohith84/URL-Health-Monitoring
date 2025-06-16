# URL Health Monitor

A comprehensive web application for monitoring the health status of multiple URLs with real-time checks, statistics, and historical data.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)
![React](https://img.shields.io/badge/react-18-blue.svg)

## Features

- ✅ **Real-time URL Health Monitoring**: Check if websites are UP or DOWN
- ⏱️ **Response Time Tracking**: Monitor website response times
- 📝 **Bulk URL Management**: Add and manage multiple URLs at once
- 🔄 **Automated Checks**: Automatic health checks every 5 minutes
- 📊 **Health Statistics**: Track uptime percentage and average response times
- 📈 **Historical Data**: Store and display check history
- 🎨 **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- 🐳 **Dockerized**: Complete containerization for easy deployment

## Tech Stack

### Backend
- **Node.js** with Express.js
- **Axios** for HTTP requests
- **node-cron** for scheduled tasks
- **File-based storage** (JSON files)

### Frontend
- **React 18** with Hooks
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Recharts** for data visualization

### Infrastructure
- **Docker** and Docker Compose
- **Nginx** for frontend serving

## Project Structure

```
url-health-monitor/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   └── data/
│       ├── urls.json
│       └── checks.json
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── index.css
        └── App.js
```

## Quick Start

### Prerequisites

- Docker and Docker Compose installed on your system

### Installation and Setup

1. **Clone or create the project structure:**
   ```bash
   mkdir url-health-monitor
   cd url-health-monitor
   ```

2. **Create the directory structure:**
   ```bash
   mkdir -p backend frontend/src frontend/public
   ```

3. **Copy all the provided files to their respective directories**

4. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## API Endpoints

### URLs Management
- `GET /api/urls` - Get all monitored URLs
- `POST /api/urls` - Add new URLs
- `DELETE /api/urls/:url` - Delete a URL

### Health Checks
- `POST /api/check-url` - Check single URL
- `POST /api/check-all` - Check all URLs
- `GET /api/history` - Get check history
- `GET /api/stats` - Get health statistics

### System
- `GET /health` - Backend health check

## Usage

1. **Add URLs**: Enter URLs in the text area (one per line) and click "Add URLs"
2. **Check Status**: Click "Check All" to perform immediate health checks
3. **View Statistics**: Switch to the "Statistics" tab to see uptime percentages and performance metrics
4. **Automatic Monitoring**: The system automatically checks all URLs every 5 minutes

## Features Detail

### URL Health Checking
- Validates URL format before adding
- Checks HTTP status codes (200-399 considered healthy)
- Measures response time in milliseconds
- Handles timeouts and network errors
- Stores detailed error messages

### Data Storage
- URLs stored in `backend/data/urls.json`
- Check results stored in `backend/data/checks.json`
- Automatic cleanup (keeps last 1000 checks)
- Persistent storage through Docker volumes

### Statistics
- **Uptime Percentage**: Calculated from historical checks
- **Average Response Time**: Mean response time across all checks
- **Total Checks**: Number of times each URL has been checked
- **Last Check Status**: Most recent check result

### Automatic Monitoring
- Runs every 5 minutes using node-cron
- Checks all configured URLs
- Stores results automatically
- Continues running in background

## Development

### Running without Docker

#### Backend
```bash
cd backend
npm install
npm start
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

### Environment Variables
- `PORT`: Backend port (default: 3001)
- `NODE_ENV`: Environment mode

## Docker Configuration

### Services
- **backend**: Node.js API server on port 3001
- **frontend**: Nginx-served React app on port 3000

### Volumes
- `./data:/app/data` - Persists check data

### Networks
- Custom bridge network for service communication

## Customization

### Check Interval
Modify the cron schedule in `server.js`:
```javascript
cron.schedule('*/5 * * * *', async () => {
  // Change '*/5 * * * *' to desired interval
});
```

### Timeout Settings
Adjust request timeout in `checkUrlHealth` function:
```javascript
const response = await axios.get(url, {
  timeout: 10000, // Change timeout value
});
```

### Data Retention
Modify the check history limit:
```javascript
const limitedChecks = newChecks.slice(-1000); // Change limit
```

## Monitoring and Logging

- Backend logs all automatic checks
- Error handling for failed requests
- Health check endpoint for monitoring
- Console output for debugging

## Security Considerations

- Input validation for URLs
- CORS configuration
- No authentication (add as needed)
- File-based storage (consider database for production)

## Production Deployment

- Use environment variables for configuration
- Implement proper logging
- Add authentication if needed
- Use a proper database instead of JSON files
- Configure SSL/TLS
- Set up monitoring and alerting

## Troubleshooting

### Common Issues
- **Port conflicts**: Change ports in `docker-compose.yml`
- **Permission issues**: Ensure data directory is writable
- **Network issues**: Check Docker network configuration
- **CORS errors**: Verify backend URL in frontend

### Logs
```bash
# View logs
docker-compose logs backend
docker-compose logs frontend

# Follow logs
docker-compose logs -f
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.

---

**Happy Monitoring!** 🚀
