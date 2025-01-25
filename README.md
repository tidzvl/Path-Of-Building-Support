# Path-Of-Building-Support

## Simple Documentation

### Task 1

- Build the extension have function scan the pob display by mouse move.
- Per mouse move, item discription change, i take this and throw to list.
- Per item find by mouse, i find the modified of item in `get list of stat` api.
- After that, i build the query have all item modified and post to search.
- The search post is realtime. And display how many item list on trade site.
- That can build the sort link to go trade site.
----------------------------------------------------------------

### Task 2

- Detect full gems at gem list. 
- Per gem, we can get requirements level and who is sell that.
- [OPTIONAL] if i'm intellisense, i can get token and get level of character realtime. Per level up, i can notifications to user for buy the gem.
- If i'm not intellisense, i want to build the roadmap of gem for user.

----------------------------------------------------------------

### Task 3

- If it ok, i can build the application have function auto whisper the seller when item i checked is listing.


### Update Item Modified

- Per item, we have the "Base Name" first, Quality and normal base mod can be skipped. It place in <ul> first
- At modified, the Implict mod place in the second <ul> with color is **#88f**.
- The explict and crafting mod place in the third <ul>.

### Update Use Api

- The api can use in extension developer console, but the console of current web is not available. 
- I think i can use dev console to fetch api and code the mes to return backend.