const Apify = require('apify');
const urlClass = require('url');

const { utils: { log } } = Apify;

// at this point, the main page is already loaded in $
exports.handleStart = async ({ $, request }) =>
{
    const requestQueue = await Apify.openRequestQueue();
    //start page, add all categories links to requestQueue
   
    const listAlreadyExist = $( ".c-product__title" ).map(function ()
    { return $(this).find('a').attr('href'); }).get();
    
    log.info('I am in handleStart()')
    log.info($.html())

    if (listAlreadyExist.length > 0) {
        await requestQueue.addRequest({
            url: request.url,
            userData: { label: 'LIST' },
            uniqueKey: request.url + 'list'
        });
    } else {

        const links = $('div#box-categories').find('li').find('h2').map(function ()
        { return $(this).find('a').attr('href'); }).get();
        
        for (let link of links)
        {   
            // request is an object, setting url to link and in userdata, setting new dictionary label: LIST
            // it is me who is setting the label value, just using it for making the crawler fcn more clear
            await requestQueue.addRequest({
                url: link,
                userData: { label: 'LIST' },
            });
        }
    }

};

exports.handleList = async ({ request, $ }) =>
{
    const requestQueue = await Apify.openRequestQueue();
    //add detail pages of all products on the page to requestQueue
    const links = $( ".product-container" ).map(function ()
    { return $(this).find('a').attr('href'); }).get();
    
    for (let link of links)
    {
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

    //add next page to requestQueue
    let nextLink = $('a.next').attr('href');
    if (!nextLink) nextLink = $('.c-pagination__button').attr('href');
    if (nextLink)
    {
        const baseUrl = request.url.replace(/\?f=\d+/, '');
        const nextUrl = urlClass.resolve(baseUrl, nextLink);
        requestQueue.addRequest({ url: nextUrl, userData: { label: 'LIST' } });
    }
    else
    {
        log.info(request.url + ' finish!!');
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
            }
        });
    
};

exports.handleDetailSpecifikace = async ({ request, $ }) =>
{
    const requestQueue = await Apify.openRequestQueue();
    let result = request.userData.result;
    result.specifikace = $('div#full-product-description').text();

    const paramTableRows = $(".product-body__specification__params__table tr").get();
    result.parametry = [];
    
    for (i = 1; i < paramTableRows.length; i++)
    {
        let parametr = {};
        let name = $("span[id*=param-name]", paramTableRows[i]).text();
        parametr[name] = $("span[id*=param-value]", paramTableRows[i]).text();
        result.parametry.push(parametr);
          
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
            }
        });
    };

    
    exports.handleDetailReview = async ({ request, $ }) =>
    {
        const requestQueue = await Apify.openRequestQueue();
        result = request.userData.result;

        if (request.userData.label === 'DETAIL-REVIEW')
        {
            const requestQueue = await Apify.openRequestQueue();
            let result = request.userData.result;
            result.recommendedByNumber = $(".recommendation span").text();
            const notRecommended = $(".no-recommendation span").text();
            if (notRecommended)
            {
                result.notRecommendedByNumber = $(".no-recommendation span").text();
            }
            result.overallReviewPecentage = parseInt($("div .heureka-rank-wide span.big").text());
    
            const reviewTableRows = $(".rating-table tr").get();
            result.reviewStars = {};
        
            for (i = 0; i < reviewTableRows.length; i++)
            {
                let percentage = parseInt($(".percentage", reviewTableRows[i]).text());
                result.reviewStars[5 - i] = percentage;
                
            }
        }
         //reviews
        const reviewDivs = $('div.review');
        if (result.reviews == undefined)
        {
            result.reviews = [];
        }
       
        for (i = 0; i < reviewDivs.length; i++)
        {
            let review = {};

            review.percentage = parseInt($('.eval', reviewDivs[i]).text());
            review.text = $('.revtext p',reviewDivs[i]).text();
            review.plusText = $('div.plus li',reviewDivs[i]).map(function () { return $(this).text(); }).get();
            review.minusText = $('div.minus li',reviewDivs[i]).map(function () { return $(this).text(); }).get();
            result.reviews.push(review);
        }

        const nextLink = $('a.next').attr('href');
        if (nextLink)
        {
            const baseUrl = request.url.replace(/\?f=\d+/, '');
            const nextUrl = urlClass.resolve(baseUrl, nextLink);
            requestQueue.addRequest({ url: nextUrl, userData: { label: 'DETAIL-REVIEW-NEXTPAGE', result : result } });
        }
        else
        {
            await Apify.pushData(result)
        }
};
