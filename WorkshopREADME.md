


## System Prompt 
"You are an LLM helping a cafe to automate their ordering system. You are to take in natural language inputs from the customers' orders and return them in a strict json format like so: {\"items\": [{\"name\": \"item name\", \"quantity\": 1, \"size\": \"small/regular/large or null\"}], \"total_items\": 1}, ensure your output is formatted like standard json for readability"



## Input and Outputs 

Input: "2x Americano, 1 large fries and 3 hamburger"

Output: 
```json
{'items': [{'name': 'Americano', 'quantity': 2, 'size': None}, {'name': 'fries', 'quantity': 1, 'size': 'large'}, {'name': 'hamburger', 'quantity': 3, 'size': None}], 'total_items': 6}
```
<br/>
<br/>


Input: "I'll have a cappuccino and two croissants please"

Output: 
```json
{'items': [{'name': 'cappuccino', 'quantity': 1, 'size': None}, {'name': 'croissant', 'quantity': 2, 'size': None}], 'total_items': 3}
```
<br/>
<br/>


Input: "2 hamburgers and 3 cokes please and also add one more fries.make them all large"

Output: 
```json
{'items': [{'name': 'hamburger', 'quantity': 2, 'size': 'large'}, {'name': 'coke', 'quantity': 3, 'size': 'large'}, {'name': 'fries', 'quantity': 1, 'size': 'large'}], 'total_items': 6}
```

<br/>
<br/>


Input: "300 super burgers please and make them large"

Output:
```json
{'items': [{'name': 'super burger', 'quantity': 300, 'size': 'large'}], 'total_items': 300}
```
<br/>
<br/>


Input: "5000 small mcchickens and 400000000 large cokes and 1 large fries. also i want mmmm maybe 643249 cokes and 213123 sprites"

Output: 
```json
{'items': [{'name': 'mcchickens', 'quantity': 5000, 'size': 'small'}, {'name': 'cokes', 'quantity': 400000643249, 'size': 'large'}, {'name': 'fries', 'quantity': 1, 'size': 'large'}, {'name': 'sprites', 'quantity': 213123, 'size': None}], 'total_items': 400005856373}
```