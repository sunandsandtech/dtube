Template.login.helpers({
  users: function() {
    return Users.find().fetch()
  }
})

Template.login.events({
  'submit .form': function(event) {
    event.preventDefault()
    var username = event.target.username.value;
    var privatekey = event.target.privatekey.value;
    if (!username || !privatekey) {
      toastr.error('Please fill both username and private posting key to login', 'Error')
      return
    }
    steem.api.getAccounts([username], function(err, result) {
      if (!result || result.length < 1) {
        toastr.error('Username does not exist', 'Error')
        return
      }
      var chainuser = result[0]
      var user = {
        privatekey: event.target.privatekey.value
      }
      try {
        user.publickey = steem.auth.wifToPublic(user.privatekey)
      } catch (e) {
        toastr.error('Private Posting Key is wrong', 'Error')
        return
      }

      if (chainuser.posting.key_auths[0][0] == user.publickey) {
        // correct key for the user, loggin in
        user.username = username
        Waka.db.Users.upsert(user, function() {
          Users.refreshUsers()
          Session.set('activeUsername', user.username)
          FlowRouter.go('/')
        })
      } else {
        toastr.error('Username and Private Posting Key do not match', 'Error')
      }
    });

    // getKeyReferences doesn't work for everyone it seems (eg: steeminator3000)
    // gotta use something else and ask for username unfortunatly
    // steem.api.getKeyReferences([publickey], function(err, result) {
    //   user.username = result[0][0]
    //   Waka.db.Users.upsert(user, function() {
    //     Users.refreshUsers()
    //     Session.set('activeUsername', user.username)
    //     FlowRouter.go('/')
    //   })
    // });
  }
})