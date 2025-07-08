echo "Waiting for MongoDB to start..."
sleep 10

for file in /dbinit/data/*.json; do

  filename=$(basename "$file" .json)
  echo "Importing $file as $filename.json into collection $filename"
  mongoimport --jsonArray --host mongodb --db NICU-db --collection "$filename" --file "$file"

done