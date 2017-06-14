# MeDao

### TO DO

Maximum Effort (needs gui and backend)

- comment view

Some Effort (some gui some backend)

- Remove Bid
- send button
- receive button
- pay button

Minimum Effort (no gui some backend)

- Next Auction timer seconds are based on real time seconds but should update on a per block basis with block.timestamp instead of Date.now()
- Clicking on place bid too soon will cause it to load without teir info loaded



### Notes
            
<h3 style="margin-bottom:0px;">Remove Bid</h3>
<div>
    <md-input-container class="md-block" md-no-float>
        <label>Bid ID</label>
        <input type="number" ng-model="medao.auction.removeBid.bidID">
    </md-input-container>
    <div layout="row">
        <span flex></span>
        <md-button class="nav-button md-raised md-primary" ng-disabled="!(medao.auction.removeBid.bidID > 0)" ng-click="removeBid()">remove</md-button>
    </div>
    <p>Your Placed Bids:</p>
    <div ng-repeat="bid in currentAccount.allBids">
        <span class="cursor" style="float:left" ng-click="medao.auction.removeBid.bidID = bid.toNumber()"><bid style="padding:5px;" id="bid.toNumber()" medao="medao.address"></bid></span>
    </div>
</div>



<h3 style="margin-bottom:0px;">Submit Proof of Work</h3>
<div>
    <md-input-container class="md-block" md-no-float>
        <label>Hours</label>
        <input type="number" ng-model="medao.submitProofOfWork.burnAmount">
    </md-input-container>
    <md-input-container class="md-block" md-no-float>
        <label>Comment</label>
        <textarea type="text" ng-model="medao.submitProofOfWork.comment" rows="5"></textarea>
    </md-input-container>
    <div layout="row">
        <md-button class="nav-button md-raised md-warn">max</md-button>
        <span flex></span>
        <md-button class="nav-button md-raised md-primary" ng-disabled="!(medao.submitProofOfWork.burnAmount > 0) && medao.submitProofofWork.comment" ng-click="submitProofOfWork()">submit</md-button>
    </div>
</div>

