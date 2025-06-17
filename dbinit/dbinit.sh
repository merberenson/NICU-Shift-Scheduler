echo "Waiting for MongoDB to start..."
sleep 10 

for file in /dbinit/data/*.csv; do
  filename=$(basename "$file" .csv)
  echo "Importing $filename.csv into collection $filename"

  mongoimport --host mongodb --db rsdb --collection "$filename" \
    --type csv --headerline --file "$file"
done