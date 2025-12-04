import app from './app.js'
import {ENV} from './config/env.js';

const PORT = ENV.PORT;
const startServer = async () =>{
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();