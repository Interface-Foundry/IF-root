# SweetBRZ
![BranRuz](https://ylegoff.com//assets/branruz-logo-small.png) SweetBRZ is a simple and responsive theme for [Ghost CMS](https://github.com/TryGhost/Ghost), initially inspired from the excellent [Frostmango](https://github.com/Anstroy/Frostmango).

SweetBRZ is based on Bootstrap 4.
A demo is available on [this blog](https://ylegoff.com).

# Featured
- Bootstrap 4
- Responsive layout
- Fully responsive
- Design Clean
- Search box with [Google Custom Search ](https://cse.google.com/cse/all)
- Cover images for blog, posts, tags et auteurs.
- [FancyBox](http://fancybox.net) support for images in posts
- Social Icons
- Code syntax support with [PrismJS](http://prismjs.com/#languages-list)
- Menus and static pages support
- Donate button support ( you can always dream :-) )
- Easy to customize

# Installation
Read the article [How to Install a Ghost Theme](https://www.ghostforbeginners.com/how-to-install-a-ghost-theme) 

# Paramétrage
All parameterization is done using the menu Code Injection, dans la partie Blog Header.

## Social 
Add the code below in the Blog Header paty
Fill the URLs you want, remove the other ones.

```javascript
<script>
  sbrzLinkedin   ="https://www.linkedin.com/in/url";
  sbrzGoogleplus = "https://googleplus_url";
  sbrzGithub     = 'https://github_url';
  sbrzFacebook   = 'https:/facebook_url'
  sbrzTwitter    = 'https:/twitter_url'
  sbrzDribbble   = 'https://dribbble_link';
  sbrzPinterest  = 'https://pinterest_link';
  sbrzVimeo      = 'https://vimeo_link';
  sbrzDropbox    = 'https://dropbox_link';
  sbrzWechat     = 'https://wechat_link';
  sbrzYoutube    = 'https://youtube_link';*/
</script>
```

## Search using [Google Custom Search ](https://cse.google.com/cse/all)
For this to work you need to create a Google dedicated search. Here is a [full how to ](http://academy.ghost.org/how-to-add-google-custom-search-to-your-ghost-blog/) 
```javascript
<script>
  sbrzGSearchID  = 'ID Google Search';
</script>
```
## Add a Donation button
You just need to add the URL to the paiement site and a label for the button
```javascript
<script>
  sbrzPay="URL";
  sbrzPayLabel="Offer me a beer";
</script>
```
## Full example

Below a full example:
![](https://ylegoff.com//content/images/2016/09/SweetBRZCodeInject-2.png)

