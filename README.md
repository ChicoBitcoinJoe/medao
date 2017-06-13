# MeDao

### TO DO

- ReadMe



### Notes


<div class="darker-background" ng-show="view.panels.manage || screenIsReallyBig" layout="column" layout-fill flex flex-gt-sm="50">
            <div style="overflow:hidden" layout="column" layout-fill>
                <h3 layout="row" layout-padding layout-margin>MeDao Actions</h3>
                <div style="overflow:auto">
                    <div layout="column" layout-padding>
                        <h3 style="margin-bottom:0px;">Place Bid <small>(Top 5 Bidding Teirs)</small></h3>
                        <div> </div>
                        <div>
                            <div layout="column" layout-align="center center">
                                <p>A bid placed on a new teir must have an adjacent teir (or anchor teir) selected. This can be eventually automated away. Click on a teir to set it as the anchor teir.</p>
                                <div ng-repeat="value in medao.auction.teirs track by $index" layout="row" flex>
                                    <div class="cursor" ng-click="medao.placeBid.touchingTeir = value">
                                        {{medao.totalBids[value]}} bids at <b>{{value | fromWei:'ether'}} Ether</b>
                                    </div>
                                </div>
                            </div>
                            <md-input-container class="md-block" md-no-float>
                                <label>Ether</label>
                                <input type="number" ng-model="medao.auction.placeBid.ether">
                            </md-input-container>
                            <p flex><span flex></span><small>Anchor Teir: {{medao.placeBid.touchingTeir | fromWei:'ether'}}</small></p>
                            <div layout="row" flex>
                                <md-button class="nav-button md-raised md-warn" ng-click="medao.auction.placeBid.ether = currentAccount.ether.balance">max</md-button>
                                    <md-button class="nav-button md-raised" ng-click="medao.auction.placeBid.ether = medao.auction.highestBid">highest</md-button>
                                <span flex></span>
                                <md-button class="nav-button md-raised md-primary" ng-disabled="!(medao.auction.placeBid.ether > 0 || medao.placeBid.touchingTeir == 0)" ng-click="placeBid()">place</md-button>
                            </div>
                        </div>
                        
                        <div style="margin: 12px 0px; padding:0px; border-top: 2px solid rgba(255,255,255,0.87);"></div>
                        
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
                        
                            <div style="margin: 12px 0px; padding:0px; border-top: 3px solid rgba(255,255,255,0.87);"></div>
                        
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
                   
                        <div style="margin: 12px 0px; padding:0px; border-top: 3px solid rgba(255,255,255,0.87);"></div>

                        
                    </div>
                </div>
            </div>
        </div>