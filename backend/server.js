import app from './src/app.js'
import {ENV} from './src/config/env.js';

const PORT = ENV.PORT;
const startServer = async () =>{
    // await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();