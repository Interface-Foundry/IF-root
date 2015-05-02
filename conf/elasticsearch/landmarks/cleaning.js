db.landmarks.update({'source_google.reviews.0': ""}, {$set: {'source_google.reviews': []}}, {multi: true})

