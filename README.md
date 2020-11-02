# Heureka.cz scraper

The actor will scrape all products from 3 categories on [Heureka.cz](https://www.heureka.cz/). It is going through the whole categories and pagination, gets the link to the product details and gets data (item name, price, shops list, reviews, product specification) in format as shown below.

Example item:
``` 
{
 {
  "itemUrl": "https://ochrana-pleti-v-zime.heureka.cz/weleda-coldcream-30-ml/",
  "itemName": "Weleda Coldcream 30 ml",
  "currentPrice": 205,
  "breadcrumb": "Kosmetika a zdraví » Kosmetika » Pleťová kosmetika » Ochrana pleti v zimě » Weleda Coldcream 30 ml",
  "currency": "CZK",
  "inTop": "TRUE",
  "shop": [
    {
      "name": "Krasa.cz",
      "price": "227 Kč",
      "numberOfReviews": 22849
    },
    {
      "name": "EUCLékárna.cz",
      "price": "242 Kč",
      "numberOfReviews": 9917
    },
    {
      "name": "Kosmetika-Zdraví.cz",
      "price": "218 Kč",
      "numberOfReviews": 5813
    },
    {
      "name": "Lékárna.cz",
      "price": "245 Kč",
      "numberOfReviews": 61477
    },
  ],
  "specification": "Krém Coldcream poskytuje účinnou ochranu pleti před chladem a sychravým počasím. Nadměrné sluneční záření, vítr, mráz a další nevlídné počasí nepříznivě působí nejen na suchou a citlivou pokožku. Díky složení je Coldcream vhodný též k péči o unavenou pokožku rukou, drsnou pokožku loktů či kolen nebo o pokožku namáhanou chladem či klimatizovaným prostředím kanceláří.",
  "parameters": [
    {
      "Značka": "Weleda"
    },
    {
      "Výrobce": "Weleda"
    },
    {
      "Použití krému": "denní"
    },
    {
      "Objem": "30"
    },
    {
      "Sada": "ne"
    }
  ],
  "recommendedByNumber": "11",
  "overallReviewPecentage": 92,
  "overallReviewNumber": {
    "Ověřené": 8,
    "Pozitivní": 7,
    "Negativní": 1,
    "Odborné": 0,
    "Video": 0,
    "Všechny": 11
  },
  "reviewStars": {
    "1": 0,
    "2": 0,
    "3": 5,
    "4": 20,
    "5": 75
  }
}
}
```
