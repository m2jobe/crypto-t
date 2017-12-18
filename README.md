[![CircleCI](https://circleci.com/gh/aastein/crypto-trader/tree/master.svg?style=svg&circle-token=ed13989cea476fd5f00e9e3abaa47c6bcc563c6f)](https://circleci.com/gh/aastein/crypto-trader/tree/master)

# Decentra

Stand alone client side automated trading for crypto-currency exchanges.

Similar to <a target="_blank" href="https://coinbase.github.io/gdax-tt/gtt_about.html">GTT</a>, Decentra's purpose is to provide a unified dashboard for all crypto-currency exchanges. Decentra is a user friendly, pure frontend implementation which  elimainates the need for a trusted third party to store API keys and access tokens. Dentra prioritizes onborading truly decentralized exchanges.
</br>
</br>
WIP @ <a target="_blank" href="https://aaronste.in">decentra.exchange</a>

## Getting Started

### GDAX

GDAX authorization is done using the **cb-seesion** header.

Login to GDAX
Open the browser console and navigate to the settings page

<img src="/public/step1.png" height="200">

Find the GET request for /profiles

<img src="/public/step2.png" width="450">

Copy the cb-session in the request headers

<img src="/public/step3.png" width="500">

Go to the profile page on crypto-trader and paste in the cb-session to the session input and click save

<img src="/public/step4.png" width="450">


## Features

- Custom scripting
- Order execution
- Backtesting

### Testing your scripts

Write scripts using the `now` array index when accessing current data.
Pass in custom id's to the buy() and sell() methods to label the plot lines.
```
if(rebound){
  buy('reboud')
} else if(kOverBuy){
  buy('kOverBuy')
}else if (lastKOverD){
  sell('lastKOverD')
} else if(!nowKOverD) {
  sell('!nowKOverD')
}
```
<img src="/public/chart.png" width="450">
Red lines represent sells.
Red dotted lines represent sells for a loss.
Green lines represent buys.


THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
