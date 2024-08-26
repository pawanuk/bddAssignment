@placeBets
Feature: Place bets on multiple candidates

  Scenario: Place bets on candidates with random data
    Given I am logged in to Betfair
    When I navigate to the Politics section
    And I place a bet on the following candidates:
      | candidate      |
      | Kamala Harris  |
      | Donald Trump   |
      | Nikki Haley    |
  

  @only-odds
  Scenario: Entering only odds
    When I enter only odds without entering a stake amount
    Then the "Place bets" button should not be enabled

  @only-stake
  Scenario: Entering only a stake amount
    When I enter only a stake amount without entering any odds
    Then the "Place bets" button should not be enabled

@exceeds-balance
  Scenario: Entering a stake that exceeds the account balance
    When I place a bet on "Donald Trump" with odds "2" and a stake of "123456789"
    Then an error message should be displayed indicating insufficient funds
   

@json-bets
Scenario: Place bets on candidates using JSON data
# Given I am logged in to Betfair
  Given I load candidate data from the JSON file "src/test-data/betData.json"
    When I place bets using the candidate data from the JSON file
    Then I verify the profits for all candidates from the JSON file
  Then I log out from the application
