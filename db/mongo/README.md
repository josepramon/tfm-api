# Mongo database for developing and testing purposes

The grunt server task called 'server' starts an Express server to serve the restful API that uses mongo.
The task starts a mongod instance using the directory *db/mongo/data* as a data directory and uses the configuration defined in *db/mongo/conf/mongodb.conf*.

To setup the mongodb instance just run `grunt mongo:setup` (you need to install mongo first with brew or whatever). This will create the required directories and log files.

You can also use a mongo instance with the data stored somewhere (like the default *data/db*). In that case, comment the ´mongod_start´ subtask and define the connection params in the *env* file (see the gruntfile, it's explained there).
