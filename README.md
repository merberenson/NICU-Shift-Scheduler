# Reservation-System
Download Github Desktop for your convenience
Download Docker Desktop
Install docker-compose and docker

git clone repository
checkout dev
create your branch


docker-compose up --build


Front end
open localhost:3000 for react frontend

modify files under 
./frontend/src 
to make updates

checkout https://react.dev/learn for more about react

When you need new packages, let me know or update package.json under frontend


Back end
open localhost:5000 for node express backend api test
download
https://www.mongodb.com/try/download/compass
and connect to mongodb://localhost:27017/ to view data.

modify files under 
./backend/src 
to make updates

When you need new packages, let me know or update package.json under frontend

To load additional tables from csv file, add new file under ./dbinit/data and rebuild the image.


When you make changes to environment or data, please feel free to bring down all containers by running 
ctrl + c in already open docker log 
OR docker stop in new terminal

Then run 
docker system prune -a 
to delete all already built image
Then you can re-run docker-compose up --build to cleanly build new image.


When you are done making changes, commit and push to github to your FEATURE BRANCH, then create PR on Github website.
