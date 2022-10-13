import { Sequelize } from 'sequelize'

const initializeDB = () => {
    
}
let dbIP = ""
/*const data = await readFile("/home/ubuntu/temp.json", 'utf8')

const ec2MetaData = JSON.parse(data).Reservations

for (let i = 0; i < ec2MetaData.length; i++) {
    let instances = ec2MetaData.Instances
    for (let j = 0; j < instances.length; j++) {
        let instance = instances[j];
        if (instance.State.Name === "running") {
            dbIP = instance.PrivateIpAddress
            break;
        }
    }
}
*/
const dbService = new Sequelize(process.env.PKR_VAR_MYSQL_DATABASE, process.env.PKR_VAR_MYSQL_USER, process.env.PKR_VAR_MYSQL_PASSWORD, {
    dialect: 'mysql',
    host: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
        evict: 10000,
    }
})

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

while (true) {
    try {
        await dbService.authenticate();
        console.log("Connection has been successfully established")
        break;
    }
    catch (err) {
        console.log("Connection failed.")
        await timeout(5000);
    }
}




export default dbService;
export { dbIP };
