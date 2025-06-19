# Reservation-System

## requirement
Download and install followings

| Tool              | Mandatory             | what is this for?           | url           |
| -------------     | -------------         | ------------- | ------------- |
| Docker Desktop    | YES                   | Create and running containarized images | https://www.docker.com/products/docker-desktop/ |
| Github Desktop    | NO (but good to have) | Code base version control. If you prefer commandline, that is totally cool. | https://desktop.github.com/download/ |
| Mongo Compass     | NO (but good to have) | Easy access to mongo db database from local. | https://www.mongodb.com/products/tools/compass |
| VScode            | NO (but good to have) | Most common code ide. If you have other ide to use, that is totally fine too. | https://code.visualstudio.com/ |
| Postman           | NO (but good to have) | Test APIs | https://www.postman.com/ |


Once you have installiation is done,

Clone our repository to a location where you are comfortable with.

The structure looks like
<pre>
Reservation-System/
├── backend/
│   ├── node_modules/
│   ├── Dockerfile
│   ├── nodemon.json
│   ├── package.json
│   └── server.js
├── dbinit/
│   ├── data/
│   │   └── sample_data.csv
│   └── dbinit.sh
├── frontend/
│   ├── node_modules/
│   │   └── ...
│   ├── public/
│   │   └── ...
│   ├── src/
│   │   └── App.js
│   ├── .gitignore
│   ├── Dockerfile
│   ├── package-lock.json
│   └── package.json
├── .dockerignore
├── .gitignore
├── docker-compose.yaml
└── README.md
</pre>

You probably DON'T have to touch files outside of,
- ./frontend/src/ *(directory for frontend update)*
- ./frontend/package.json   *(need to modify it when you need to use new package for frontend react)*
- ./backend/server.js *(API service server code)*
- ./backend/package.json   *(need to modify it when you need to use new package for backend)*
- ./dbinit/data/   *(directory where you can drop csv files to be inserted into mongodb)*


## Initial setup

### 1. Create your feature branch
When you want to work on a feature, what you need to do is to create your feature branch from dev branch.

you can either use docker desktop to create feature branch or you can run following commandline if you have git installed
<pre>
git checkout dev
git pull
git checkout -b [branch-name] dev
</pre>

### 2. Create Images and spin up

Open up VSCode (or your IDE) at the root of the repo directory.

Open up terminal at the root of the repo directory.

run
<pre>
docker-compose up --build
</pre>

If you see port already in use error, try updating docker-compose.yaml file as below
<pre>
...
  backend:
    build: ./backend
    container_name: backend
    ports:
      - '5001:5000'     [original - '5000:5000']
...
  frontend:
    build: ./frontend
    container_name: frontend
    ports:
      - '3001:3000'     [original - '3000:3000']
...
</pre>
and rerun the command

When all the container is spin-up, you are ready to develop.

### 3. ReBuild Image

When you are applying environment or package update, or if you want to rebuild the images for some reason, you need to spin down running containers by ctrl + C on opened docker log terminal. Or you can also open up a new terminal, and run, 
<pre>
# to see running containers
docker ps  

# stop running containers
docker stop [image name]

# delete all images already exist on your computer
docker system prune -a
</pre>
to clean the docker. Then you can re-run
<pre>
docker-compose up --build
</pre>
to create new images.


### 4.1 FRONTEND
On your local browser, go to https://localhost:3000 (or 3001 if you have make the update above). 

Modify files under 
<pre>
./frontend/src/
</pre>
in a couple of seconds, you will be able to see the change on browser.

I have added how you can make api call to the backend API from frontend.

Checkout   
https://react.dev/  
https://legacy.reactjs.org/  
https://devhints.io/react  
https://ej2.syncfusion.com/home/react.html#platform  
https://react.semantic-ui.com/layouts/


### 4.2 BACKEND
On your local browser, go to https://localhost:5000 (or 5001 if you have make the update above). 

Modify
<pre>
./backend/server.js
</pre>
you can refresh the browser to see the change.  
I have added sample script for accessing mongodb.

### 5.1 Testing Backend / API
You can open the api path on browser as https://localhost:5000/api/hello to test the Backend before using it from frontend or when you are testing your new api.  

More standard way as it returns prettier response is to use Postman. You can also use Postman to test your backend API, by running api call to your localhost at the same location.


### 5.2 Testing Database
Run Mongo Compass.  
Connect to `mongodb://localhost:27017`  
Open up rsdb database from left pannel.  
Click on the table that you want to check.


### 6. PR
When you are done making changes, tested on local through thorough testings, commit your changes, push it to remote repository, then create PR, so that we can review it together.

Let me know if you have questions in this process.
