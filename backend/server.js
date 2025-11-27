import app from './src/app.js'
import {ENV} from './src/config/env.js';

const PORT = ENV.PORT;
const startServer = async () =>{
    app.listen(PORT, () => {
        console.log(`Server runnig on port ${PORT}`);
    });
}

startServer();