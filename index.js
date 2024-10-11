const readline = require("readline");
const { clearTimeout } = require("timers");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const maxnumber = 31;
let maxmoney = 0;

function makeRandom(min, max) {
  minimum = Math.ceil(min);
  maximum = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let players = [];

function mix_turn(pls) {
  for (let i = pls.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pls[i], pls[j]] = [pls[j], pls[i]];
  }
  return pls;
}

let Betting_Money = 0;
const Start_money = 100000;

function getMaxmoney() {
  return new Promise((resolve) => {
    rl.question("계좌의 초기 한도 액수를 지정해주세요. >>> ", (mm) => {
      resolve(parseInt(mm));
    });
  });
}

async function getPlayerAmount() {
  maxmoney = await getMaxmoney();
  rl.question("인원수를 입력해주세요. >>> ", (pa) => {
    console.log(`총 플레이어 수는 ${pa}명입니다.`);
    console.log(
      "게임 진행 중 숫자를 입력하실 때는 띄어쓰기로 구분하여 입력해주세요, 예시)28 29 30"
    );

    for (let i = 1; i < pa; i++) {
      players.push(new player(`인공지능 ${i}`, true, maxmoney));
    }

    players.push(new player(`사용자(나)`, false, maxmoney));
    //getBettingamount();

    // 게임 루프 시작
    do_game(mix_turn(players));
  });
}

function getBettingamount() {
  return new Promise((resolve) => {
    rl.question(
      `초기 잔고는 ${maxmoney}원입니다. 게임에 걸고자 하는 ${maxmoney}원 이내에서 입력해주세요. >>> `,
      (Betting_money_amount) => {
        if (Betting_money_amount > maxmoney || Betting_money_amount < 0) {
          console.log(
            `입력받은 금액이 ${maxmoney}원보다 크거나 0원 미만입니다.\n다시 입력해주세요.`
          );
          resolve(getBettingamount());
        } else {
          resolve(parseInt(Betting_money_amount));
        }
      }
    );
  });
}

let result;

let now_number = 0;
let now_amount = 0;
async function do_game(pls) {
  Betting_Money = await getBettingamount();
  while (true) {
    for (let p of pls) {
      result = await p.do_turn(now_number, now_amount);
      now_number = result.now_number;
      now_amount = result.now_amount;
      if (result.now_number >= 31 || result.now_number + 1 === 31) {
        console.log(
          `${p.name}님이 31을 넘겼거나 남은 숫자가 31밖에 없어서 패배했습니다.`
        );
        //패배한 플레이어의 잔고에서 베팅 금액만큼 차감하여 남은 플레이어에게 N빵
        p.money -= Betting_Money;
        const Other_people_amount = pls.length - 1;
        console.log(
          `${p.name}님의 잔고에서 ${Betting_Money}원 차감되었습니다.\n해당 금액은 나머지 플레이어들에게 1/${Other_people_amount}씩 소수점을 제하고 돌아갑니다.`
        );
        const Other_people_win_money =
          parseInt(Betting_Money) / parseInt(Other_people_amount);
        let pname = "";
        let pmoney = 0;
        for (i = 0; i <= pls.length - 1; i++) {
          if (pls[i].name === p.name) {
          } else {
            pls[i].money =
              parseInt(pls[i].money) + parseInt(Other_people_win_money);
          }
          if (pls[i].isAI === false) {
            pname = pls[i].name;
            pmoney = pls[i].money;
          }
        }
        console.log(`${pname}의 최종 잔액은 ${pmoney}원입니다.`);
        process.exit();
      }
    }
  }
}

class player {
  constructor(name, isAI, money) {
    this.name = name;
    this.isAI = isAI;
    this.money = money;
  }

  async do_turn(previous_maxnumber, previous_amount) {
    if (this.isAI) {
      //AI 부분의 동작 코드.
      const AI_startnumber = previous_maxnumber + 1; //직전에 사용자가 부른 가장 큰 숫자 + 1을 시작값으로 가짐.
      let output_arr = []; //AI가 생성해서 내보낼 수를 저장할 배열 선언.
      if (AI_startnumber > maxnumber || isNaN(AI_startnumber)) {
        //내가 시작할 숫자가 31이거나 NaN이면 게임 종료.
        console.log(
          `${this.name}에게 남은 숫자가 ${AI_startnumber}밖에 없어서 패배했습니다.`
        );
        output_arr.push(31);
        return { now_number: output_arr[0], now_amount: 1 };
      }
      let AI_number_amount = makeRandom(1, 3);
      if (AI_number_amount != previous_amount) {
        for (let i = 0; i < AI_number_amount; i++) {
          if (AI_startnumber + i > 30) {
            break;
          } else if (AI_startnumber + AI_number_amount - 1 === 30) {
            for (i = AI_startnumber; i <= 30; i++) {
              output_arr.push(i);
            }
          } else {
            output_arr.push(AI_startnumber + i);
          }
        }
      } else {
        while (AI_number_amount === previous_amount) {
          AI_number_amount = makeRandom(1, 3);
          if (AI_number_amount != previous_amount) {
            for (let i = 0; i < AI_number_amount; i++) {
              if (AI_startnumber + i > 30) {
                break;
              } else if (AI_startnumber + AI_number_amount - 1 === 30) {
                for (i = AI_startnumber; i <= 30; i++) {
                  output_arr.push(i);
                }
              } else {
                output_arr.push(AI_startnumber + i);
              }
            }
          }
        }
      }
      const AI_Lastnumber = output_arr[AI_number_amount - 1];
      console.log(`${this.name}의 차례: ${output_arr}\n`);
      return { now_number: AI_Lastnumber, now_amount: AI_number_amount };
    } else {
      /*
      사용자의 동작 코드.
      */
      const USER_startnumber = previous_maxnumber + 1; //직전 AI가 부른 가장 큰 숫자 + 1을 시작값으로 가짐.
      if (USER_startnumber === 31) {
        //내가 시작할 숫자가 31이면 게임 종료.
        console.log("남은 숫자가 31밖에 없어서 게임에서 패배했습니다.");
        process.exit();
      } else {
        //내가 숫자를 입력하고 그 숫자를 검증하는 부분
        async function getNum() {
          return new Promise((resolve, reject) => {
            let Input_countdown = setTimeout(() => {
              reject("제한된 시간을 초과하였습니다. 차례를 건너뜁니다.");
            }, 15000);

            console.log("==========\n",
              "[사용자 차례]\n",
              "1~3개의 숫자 중에서 " + previous_amount + "개를 제외한 갯수만큼의 숫자들을 입력해주세요.");

            rl.question(
              `시작 숫자는 ${USER_startnumber}입니다. >>> `,
              (USER_input) => {
                clearTimeout(Input_countdown);
                resolve(USER_input);
              }
            );
            
          });
        }
        let i;
        while (true) {
          try {
            let Input_arr = await getNum();
            Input_arr = Input_arr.split(" ").map(Number);

            if (Input_arr.length > 1) {
              //1개만 입력받은 경우가 아닐 때 연속되는 숫자들을 입력받은 것인지 확인
              for (i = 1; i < Input_arr.length; i++) {
                if (parseInt(Input_arr[i]) != parseInt(Input_arr[i - 1]) + 1) {
                  console.log("연속되는 숫자가 아닙니다. 다시 입력해주세요.");
                  getNum();
                }
              }
            }
            if (
              //입력받은 숫자의 시작 지점 != 내가 시작해야할 숫자의 최소값이거나, 입력받은 숫자의 갯수 === 직전 AI가 출력한 숫자의 갯수일 때 다시 입력하게끔 작동
              Input_arr[0] != USER_startnumber ||
              Input_arr.length === previous_amount ||
              Input_arr.length > 3 ||
              Input_arr.length < 1
            ) {
              if (Input_arr[0] != USER_startnumber) {
                console.log(
                  "입력받은 숫자의 첫번째 숫자와 시작해야할 숫자의 값이 일치하지 않습니다."
                );
              } else if (Input_arr.length === previous_amount) {
                console.log(
                  "직전에 다른 플레이어가 입력한 갯수와 똑같은 갯수의 숫자는 입력할 수 없습니다."
                );
              } else if (Input_arr.length > 3) {
                console.log("숫자는 한번에 최대 3개만 입력할 수 있습니다.");
              } else if (Input_arr.length < 1) {
                console.log("최소 1개 이상의 숫자는 입력하셔야 합니다.");
              }
            } else {
              /*입력 조건을 어기지 않는 정상적인 입력을 받았을 때 작동할 순서
            1 - 입력받은 숫자들이 연속되는 숫자들인지 확인.
            */
              
              //위의 조건들에 해당하지 않는다면 내가 몇 개, 뭘 입력했는지 반환하고 다음 차례로 넘기기
              let Number_Amount = Input_arr.length;
              let Last_Number = Input_arr[Number_Amount - 1];
              console.log(
                `총 ${Number_Amount}개의 숫자 ${Input_arr}(을)를 입력받았습니다.\n`
              );
              return { now_number: Last_Number, now_amount: Number_Amount };
            }
          } catch (e) {
            console.log(e);
            return {
              now_number: previous_maxnumber,
              now_amount: previous_amount,
            };
          }
        }
      }
    }
  }
}

getPlayerAmount();
