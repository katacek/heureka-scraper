# Heureka.cz scraper

The actor scrapes all products from defined sub-categories (given as input) from [Heureka.cz](https://www.heureka.cz/).

The **correct sub-category** for the input is **the one that has no other sub-categories included**. I.e. "https://bazeny-a-doplnky.heureka.cz/" is correct as after clicking on any link here, you get the products details. Url "https://dum-zahrada.heureka.cz/" is not valid as after cliking on links there, you get to another groups of categories.

For each product, it gets following data: item url, item name, current price, if the product is in TOP ones, list of shops where to buy it, product specification and reviews. 

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

## Compute units consumptios
Ie. for 3 categories, there can be more than 40ths. items. For such amount, the actor run time is app. 10 hours and it consumes app. 10 compute units.
