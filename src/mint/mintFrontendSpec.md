APP
	FetchCart → 
		Returns:
			Members: [],
			Leaders: [] || undefined
			Cart_id: string
		
		firstAction:
			Check if leader or member --> 
				If leaders && members < 1 || undefined
					→ EMAILFORM
				Else 
					→ CART

EMAILFORM
	UserEnterEmail → 
	SignIn → 
		Returns:
			newSession: {}
			newAccount: newSession.newAccount
		firstAction:
			If !newAccount
				→ WaitForEmail → !!!DEADEND
			else
				→ {SetAddingItem: true}
				→ ADDTOCARTFORM

ADDTOCARTFORM
	UserEnterItem → 
	AddItem → 
			Returns:
				item: {}
			firstAction:
				→ {SetAddingItem: false}
				→ CART

CART
	UserClicksInputLookingButton → 
		Check if local account present → 
			If account present →
				addToCartForm
			else 
				emailForm