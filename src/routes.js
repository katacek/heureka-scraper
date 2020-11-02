const Apify = require('apify');
const urlClass = require('url');

//const { utils: { log } } = Apify;

exports.handleStart = async ({ $ }) =>
{
    const requestQueue = await Apify.openRequestQueue();
    //start page, add all categories links to requestQueue
    const links = $('div#box-categories').find('li').map(function ()
    { return $(this).find('a').attr('href'); }).get();
    console.log(links);
    let count = 0;
    for (let link of links)
    {   
        count++;
        if (count > 10) break;
            await requestQueue.addRequest({
            url: link,
             userData: { label: 'LIST' },
            });
    }

};

exports.handleList = async ({ request, $ }) =>
{
    const requestQueue = await Apify.openRequestQueue();
    //add detail pages of all products on the page to requestQueue
    const links = $( ".product-container" ).map(function ()
    { return $(this).find('a').attr('href'); }).get();
    let count = 0;
    for (let link of links)
    {
        count++;
        if (count > 10) break;
        const absoluteLink = urlClass.resolve(request.url, link);
        await requestQueue.addRequest({
            url: absoluteLink + '?loadOffersSync=1',
            userData: { label: 'DETAIL' },
            headers: {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "en-US,en;q=0.9",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1"
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
        });
    }

    
};


exports.handleDetail = async ({ request, $ }) =>
{
    const requestQueue = await Apify.openRequestQueue();
    //parse detail page
    let result = {};
    result.itemUrl = request.url;
    result.itemName = $("h1[itemprop='name']").text().trim();
    if(!result.itemName)
    {
        result.itemName = $("h1.c-product-info__name").text().trim();
    }

    result.currentPrice = parseInt($("span[itemprop='price']").text().replace(' ',''));

    if(!result.currentPrice)
    {
        const price = $('meta[name="gtm:ecommerce:detail:products"]').attr('content').split('\"priceMin\": ')[1];
        if(price)
        {
            console.log(price)
            result.currentPrice = parseInt(price.replace(' ',''));
            result.currentPriceNote = "Price from metadata - lowest"
        }
    }


    if(!result.itemName || !result.currentPrice || result.currentPrice == NaN)
    {
        await Apify.setValue('HeurekaBadPage', 
            {itemName: result.itemName,
            price: result.currentPrice,
            tag: $('meta[name="gtm:ecommerce:detail:products"]').attr('content'),
            pageSource: $.html()});
        
    }
    result.breadcrumb = $('#breadcrumbs').text().trim().split('Heureka.cz » ')[1]
    result.currency = "CZK";
    if ($("div[class='top-ico gtm-header-link'] span").text() === "Top")
    {
        result.inTop = "TRUE";
    } else (
        result.inTop = "FALSE"
    )
    
    result.shop = [];
    const shopsDiv = $('div.shoppr.verified').get();
    for (i = 0; i < shopsDiv.length; i++)
    {
        //if (shopsDiv[i].name !== 'div') continue;
        result.shop.push({});
        result.shop[i].name = $('.shop-name', shopsDiv[i]).text().trim();
        result.shop[i].price = $('a.pricen', shopsDiv[i]).text();
        result.shop[i].numberOfReviews = parseInt($('a.prov__reviews-link', shopsDiv[i]).text());
    }

    const specUrl = request.url.split('?')[0] + 'specifikace/';

    //new request for specification page
    requestQueue.addRequest(
        {
            url: specUrl,
            userData:
            {
                label: 'DETAIL-SPECIFIKACE',
                result: result
            },
            headers: {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "en-US,en;q=0.9",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1"
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
        });
    
};

exports.handleDetailSpecifikace = async ({ request, $ }) =>
{
    const requestQueue = await Apify.openRequestQueue();
    let result = request.userData.result;
    let spec = $('div#full-product-description').text().trim();
    if (spec){
        result.specification = spec
    } else {
        result.specification =  $('div .product-body__specification__short-tail-desc__perex').text().trim()
    }

    const paramTableRows = $(".product-body__specification__params__table tr").get();
    result.parameters = [];
    
    for (i = 1; i < paramTableRows.length; i++)
    {
        let parametr = {};
        let name = $("span[id*=param-name]", paramTableRows[i]).text();
        parametr[name] = $("span[id*=param-value]", paramTableRows[i]).text();
        result.parameters.push(parametr);
          
    }

    const reviewUrl = request.url.replace('specifikace', 'recenze');

    //new request for specification page
    requestQueue.addRequest(
        {
            url: reviewUrl,
            userData:
            {
                label: 'DETAIL-REVIEW',
                result: result
            },
            headers: {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "en-US,en;q=0.9",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1"
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
        });
    };

    
    exports.handleDetailReview = async ({ request, $ }) =>
    {
        const requestQueue = await Apify.openRequestQueue();
        let result = request.userData.result;
        result.recommendedByNumber = $(".recommendation span").text();
        const notRecommended = $(".no-recommendation span").text();
        if (notRecommended) {
            result.notRecommendedByNumber = $(".no-recommendation span").text();
        }
        result.overallReviewPecentage = parseInt($("div .heureka-rank-wide span.big").text());
        const overallReview = $(".starsReviews li").text().replace("Zobrazit:", "").split("|").map(x => x.trim());
        result.overallReviewNumber = {}
        overallReview.forEach(x => 
            result.overallReviewNumber[x.split(" ")[0]] = parseInt(x.split("(")[1])
            );
    
        const reviewTableRows = $(".rating-table tr").get();
        result.reviewStars = {};
        
        for (i = 0; i < reviewTableRows.length; i++)
        {
            let percentage = parseInt($(".percentage", reviewTableRows[i]).text());
            result.reviewStars[5-i] = percentage;
                
        }
        
        await Apify.pushData(result)
};



    
