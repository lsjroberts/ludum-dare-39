module Main exposing (..)

import Debug
import Dict exposing (Dict)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)
import Maybe.Extra
import Octicons as Icon
import Svg
import Svg.Attributes
import Time exposing (..)


debug : Bool
debug =
    False



-- PROGRAM


main : Program Never Model Msg
main =
    program
        { init = init
        , view = view
        , update = updateWithStoryTimer
        , subscriptions = subscriptions
        }



-- MODEL


type alias Model =
    { energy : Int
    , confidence : Int
    , time : Float
    , phoneBattery : Int
    , phoneUsageTimer : Int
    , drunkenness : Int
    , beerUsageTimer : Int
    , storyKey : String
    , storyTimer : Maybe Int
    , storyDescriptionTimer : Maybe Int
    , storyHasDrunkBeer : Bool
    , storyHasMessage : Bool
    }


init : ( Model, Cmd Msg )
init =
    ( Model
        maxEnergy
        100
        0
        90
        0
        0
        0
        "arriveAtParty"
        -- "enterParty"
        -- "messageFromSimon"
        Nothing
        Nothing
        False
        False
    , Cmd.none
    )


minutesPerSecond : Float
minutesPerSecond =
    0.5


hourStart : Int
hourStart =
    22


hourFinish : Int
hourFinish =
    26


maxEnergy : Int
maxEnergy =
    500


getStoryBeat : String -> Maybe StoryBeat
getStoryBeat storyKey =
    Dict.get storyKey story



-- VIEW


view : Model -> Html Msg
view model =
    let
        storyBeat =
            case (getStoryBeat model.storyKey) of
                Just beat ->
                    beat

                Nothing ->
                    Debug.crash ("Tried to load an invalid story beat — " ++ model.storyKey)

        energyRatio =
            (toFloat model.energy) / (toFloat maxEnergy)

        scaleColour : Float -> Float -> String
        scaleColour start max =
            toString (floor (max - ((max - start) * energyRatio)))

        scaleColourDown : Float -> Float -> String
        scaleColourDown start min =
            toString (floor (min + ((start - min) * energyRatio)))

        radialCenterR =
            scaleColour 241 255

        radialCenterG =
            scaleColour 94 255

        radialCenterB =
            scaleColour 81 255

        radialCenterA =
            toString (1 - ((1 - 0.47) * energyRatio))

        radialCenterRGBA =
            radialCenterR ++ "," ++ radialCenterG ++ "," ++ radialCenterB ++ "," ++ radialCenterA

        radialOuterR =
            scaleColourDown 70 0

        radialOuterG =
            scaleColourDown 60 0

        radialOuterB =
            scaleColourDown 60 0

        radialOuterA =
            toString (1 - ((1 - 0.47) * energyRatio))

        radialOuterRGBA =
            radialOuterR ++ "," ++ radialOuterG ++ "," ++ radialOuterB ++ "," ++ radialOuterA

        circleSize =
            toString (40 + ((100 - 40) * energyRatio))
    in
        div
            [ style
                [ ( "background-image"
                  , ("radial-gradient("
                        ++ "circle at 33% 56%, "
                        ++ "rgba("
                        ++ radialCenterRGBA
                        ++ ") 0, "
                        ++ "rgba("
                        ++ radialOuterRGBA
                        ++ ") "
                        ++ circleSize
                        ++ "%)"
                    )
                  )
                , ( "background-color", "#000000" )
                , ( "height", "100vh" )
                , ( "font-family", "Roboto Slab" )
                , ( "color", "#ffffff" )
                ]
            ]
            [ viewFloor model.energy
            , viewEnergyMeter model.energy
            , viewConfidenceMeter model.confidence
            , viewDrunkenness model.drunkenness
            , viewPlayer model.energy storyBeat
            , viewSimon storyBeat
            , viewAnna storyBeat
            , viewPolly storyBeat
            , viewMehmet storyBeat
            , viewBackgroundPeople
            , viewPartyLights model.time
            , viewPhone model.phoneUsageTimer storyBeat
            , viewBeer model.beerUsageTimer storyBeat
            , viewPhoneBattery model.phoneBattery
            , viewPhoneMessageIndicator
            , viewPhoneClock model.time
            , viewStoryDescription model.storyDescriptionTimer storyBeat
            ]


viewFloor : Int -> Html Msg
viewFloor energy =
    div
        [ style
            [ ( "background"
              , ("linear-gradient(135deg, rgba(0,0,0,.2) 25%, transparent 25%) -25px 0, "
                    ++ "linear-gradient(225deg, rgba(0,0,0,.2) 25%, transparent 25%) -25px 0, "
                    ++ "linear-gradient(315deg, rgba(0,0,0,.2) 25%, transparent 25%), "
                    ++ "linear-gradient(45deg, rgba(0,0,0,.2) 25%, transparent 25%)"
                )
              )
            , ( "background-size", "50px 50px" )
            , ( "background-color", "rgba(0,0,0,0.2)" )
            , ( "position", "absolute" )
            , ( "bottom", "0" )
            , ( "height", (energy |> floorHeight |> toString) ++ "vh" )
            , ( "width", "100%" )
            ]
        ]
        []


viewEnergyMeter : Int -> Html Msg
viewEnergyMeter energy =
    div [] [ text ("Energy " ++ (toString energy)) ]


viewConfidenceMeter : Int -> Html Msg
viewConfidenceMeter confidence =
    div [] [ text ("Confidence " ++ (toString confidence)) ]


viewPhoneBattery : Int -> Html Msg
viewPhoneBattery phoneBattery =
    div
        [ style
            [ ( "position", "absolute" )
            , ( "top", "3vh" )
            , ( "right", "2vw" )
            , ( "width", "8vw" )
            , ( "padding", "2px" )
            , ( "border", "2px solid #ffffff" )
            , ( "border-radius", "6px" )
            ]
        ]
        [ div
            [ style
                [ ( "background", "#ffffff" )
                , ( "border-radius", "3px" )
                , ( "height", "4vh" )
                , ( "width", (toString phoneBattery) ++ "%" )
                ]
            ]
            []
        ]


viewPhoneMessageIndicator : Html Msg
viewPhoneMessageIndicator =
    div
        [ style
            [ ( "position", "absolute" )
            , ( "top", "3.1vh" )
            , ( "right", "18vw" )
            ]
        ]
        [ Icon.defaultOptions
            |> Icon.color "white"
            |> Icon.size 36
            |> Icon.mail
        ]


viewPhoneClock : Float -> Html Msg
viewPhoneClock time =
    let
        minutes =
            String.padLeft 2 '0' (toString ((floor time) % 60))

        hours =
            floor ((toFloat hourStart) + (time / 60))

        hoursString =
            (if hours >= 24 then
                hours - 24
             else
                hours
            )
                |> toString
                |> String.padLeft 2 '0'
    in
        div
            [ style
                [ ( "position", "absolute" )
                , ( "top", "3.1vh" )
                , ( "right", "12vw" )
                ]
            ]
            [ text (hoursString ++ ":" ++ minutes) ]


viewDrunkenness : Int -> Html Msg
viewDrunkenness drunkenness =
    div [] [ text ("Drunkenness " ++ (toString drunkenness)) ]


viewPlayer : Int -> StoryBeat -> Html Msg
viewPlayer energy storyBeat =
    viewPerson 0
        [ ( "bottom", (energy |> floorHeight |> (+) -3 |> toString) ++ "vh" )
        , ( "left", (toString storyBeat.playerPosition) ++ "vw" )
        , ( "background", "#000000" )
        ]


viewSimon : StoryBeat -> Html Msg
viewSimon storyBeat =
    let
        ( x, y ) =
            storyBeat.simonPosition
    in
        viewPerson 0.8
            [ ( "bottom", (toString y) ++ "vh" )
            , ( "left", (toString x) ++ "vw" )
            , ( "background", "#42B859" )
            ]


viewAnna : StoryBeat -> Html Msg
viewAnna storyBeat =
    viewPerson 0.3
        [ ( "bottom", "13vh" )
        , ( "left", "56vw" )
        , ( "background", "#B8B442" )
        ]


viewMehmet : StoryBeat -> Html Msg
viewMehmet storyBeat =
    viewPerson 0.4
        [ ( "bottom", "7vh" )
        , ( "left", "62vw" )
        , ( "background", "#B44A3F" )
        ]


viewPolly : StoryBeat -> Html Msg
viewPolly storyBeat =
    viewPerson 0.9
        [ ( "bottom", "12vh" )
        , ( "left", "69vw" )
        , ( "background", "#9C31CC" )
        ]


viewBackgroundPeople : Html Msg
viewBackgroundPeople =
    div []
        [ viewPerson 0.2 [ ( "bottom", "8vh" ), ( "left", "-3vw" ), ( "background", "#444" ) ]
        , viewPerson 0.2 [ ( "bottom", "5vh" ), ( "left", "-6vw" ) ]
        , viewPerson 0.1 [ ( "bottom", "10vh" ), ( "left", "19vw" ), ( "background", "#555" ) ]
        , viewPerson 0.2 [ ( "bottom", "12vh" ), ( "left", "10vw" ), ( "background", "#444" ) ]
        , viewPerson 0.1 [ ( "bottom", "6vh" ), ( "left", "14vw" ) ]
        , viewPerson 0.1 [ ( "bottom", "1vh" ), ( "left", "38vw" ), ( "background", "#444" ) ]
        , viewPerson 0.2 [ ( "bottom", "-1vh" ), ( "left", "28vw" ), ( "background", "#555" ) ]
        , viewPerson 0.1 [ ( "bottom", "-3vh" ), ( "left", "30vw" ) ]
        , viewPerson 0.2 [ ( "bottom", "16vh" ), ( "left", "88vw" ), ( "background", "#222" ) ]
        , viewPerson 0.1 [ ( "bottom", "14vh" ), ( "left", "92vw" ), ( "background", "#333" ) ]
        , viewPerson 0.1 [ ( "bottom", "7vh" ), ( "left", "81vw" ), ( "background", "#444" ) ]
        , viewPerson 0.2 [ ( "bottom", "4vh" ), ( "left", "87vw" ), ( "background", "#555" ) ]
        ]


viewPerson : Float -> List ( String, String ) -> Html Msg
viewPerson jiggle styles =
    div
        [ style <|
            [ ( "position", "absolute" )
            , ( "height", "25vh" )
            , ( "width", "8vw" )
            , ( "background", "#666" )
            , ( "transition", "left 1s linear, bottom 0.2s linear" )
            ]
                ++ styles
        ]
        []


viewPartyLights : Float -> Html Msg
viewPartyLights time =
    let
        redOpacity =
            if ((floor time) % 5) < 2 then
                "0.1"
            else
                "0"

        redLight =
            Svg.polygon
                [ Svg.Attributes.points "78,-20 58,100 98,100"
                , Svg.Attributes.fill ("rgba(255, 0, 0, " ++ redOpacity ++ ")")
                ]
                []

        greenOpacity =
            if ((floor time) % 3) == 0 then
                "0.1"
            else
                "0"

        greenLight =
            Svg.polygon
                [ Svg.Attributes.points "60,-20 66,100 108,100"
                , Svg.Attributes.fill ("rgba(183, 255, 165, " ++ greenOpacity ++ ")")
                ]
                []

        blueOpacity =
            if ((floor time) % 2) == 0 then
                "0.1"
            else
                "0"

        blueLight =
            Svg.polygon
                [ Svg.Attributes.points "96,-20 50,100 88,100"
                , Svg.Attributes.fill ("rgba(165, 215, 255, " ++ blueOpacity ++ ")")
                ]
                []
    in
        Svg.svg
            [ Svg.Attributes.viewBox "0 0 100 100"
            , Svg.Attributes.width "100vw"
            , Svg.Attributes.height "100vh"
            , style
                [ ( "position", "absolute" )
                , ( "top", "0" )
                , ( "left", "0" )
                ]
            ]
            [ redLight, greenLight, blueLight ]


viewPhone : Int -> StoryBeat -> Html Msg
viewPhone phoneUsageTimer storyBeat =
    let
        canUsePhone =
            if phoneUsageTimer > 0 then
                False
            else
                storyBeat.canUsePhone
    in
        if canUsePhone then
            div
                [ style <|
                    buttonStyle
                        ++ [ ( "position", "absolute" )
                           , ( "top", "10vh" )
                           , ( "left", "10vw" )
                           ]
                , onClick UsePhone
                ]
                [ Icon.defaultOptions
                    |> Icon.color "white"
                    |> Icon.size 36
                    |> Icon.deviceMobile
                , text "Use your phone"
                ]
        else
            span [] []


viewBeer : Int -> StoryBeat -> Html Msg
viewBeer beerUsageTimer storyBeat =
    let
        canDrinkBeer =
            if beerUsageTimer > 0 then
                False
            else
                storyBeat.canDrinkBeer
    in
        if canDrinkBeer then
            div
                [ style <|
                    buttonStyle
                        ++ [ ( "position", "absolute" )
                           , ( "top", "20vh" )
                           , ( "left", "20vw" )
                           ]
                , onClick DrinkBeer
                ]
                [ Icon.defaultOptions
                    |> Icon.color "white"
                    |> Icon.size 36
                    -- |> Icon.style "vertical-align"
                    |>
                        Icon.zap
                , text "Drink some beer"
                ]
        else
            span [] []


buttonStyle : List ( String, String )
buttonStyle =
    [ ( "background", "rgba(255, 255, 255, .1)" )
    , ( "padding", "1.8vh 2vw 2vh" )
      -- , ( "border", "4px solid #ffffff" )
    , ( "border-radius", "4px" )
    , ( "font-size", "3vh" )
    , ( "line-height", "1" )
    , ( "cursor", "pointer" )
    ]


viewStoryDescription : Maybe Int -> StoryBeat -> Html Msg
viewStoryDescription maybeDescriptionTimer storyBeat =
    let
        description =
            storyBeat.description |> String.split "\n" |> List.map (\t -> p [] [ text t ])

        bottom =
            case maybeDescriptionTimer of
                Just timer ->
                    if timer > 0 then
                        "0"
                    else
                        "-20vh"

                Nothing ->
                    "0"
    in
        div
            [ style
                [ ( "position", "absolute" )
                , ( "bottom", bottom )
                , ( "width", "100%" )
                , ( "background", "#111111" )
                , ( "padding", "6vh 4vw" )
                , ( "font-size", "3vh" )
                , ( "line-height", "1.4" )
                , ( "color", "#cbd0da" )
                , ( "transition", "bottom 0.3s linear" )
                ]
            ]
        <|
            description
                ++ [ viewStoryActions storyBeat ]


viewStoryActions : StoryBeat -> Html Msg
viewStoryActions beat =
    div [] <|
        List.map viewStoryAction beat.actions


viewStoryAction : ( String, String ) -> Html Msg
viewStoryAction ( label, nextStoryKey ) =
    div
        [ style
            [ ( "margin-top", "1vh" )
            , ( "color", "#cf32d6" )
            , ( "cursor", "pointer" )
            ]
        , onClick (GoToStoryBeat nextStoryKey)
        ]
        [ text ("> " ++ label) ]


floorHeight : Int -> Float
floorHeight energy =
    (56 - ((56 - 33) * ((toFloat energy) / (toFloat maxEnergy))))



-- UPDATE


type Msg
    = Tick Time
    | TickMinute Time
    | UsePhone
    | DrinkBeer
    | GoToStoryBeat String


updateWithStoryTimer : Msg -> Model -> ( Model, Cmd Msg )
updateWithStoryTimer msg model =
    let
        newModel =
            update msg model

        unwrap =
            Maybe.Extra.unwrap newModel

        applyStoryTimer timer =
            if timer == 0 then
                unwrap applyStoryBeat (getStoryBeat newModel.storyKey)
            else
                newModel

        applyStoryBeat storyBeat =
            unwrap applyNextStoryBeat storyBeat.timeUntil

        applyNextStoryBeat ( _, nextStoryKey ) =
            update (GoToStoryBeat nextStoryKey) newModel
    in
        ( unwrap applyStoryTimer newModel.storyTimer, Cmd.none )


update : Msg -> Model -> Model
update msg model =
    case msg of
        Tick time ->
            let
                energy =
                    if phoneUsageTimer == 0 && model.energy > 0 then
                        model.energy - 1
                    else
                        model.energy

                phoneUsageTimer =
                    if model.phoneUsageTimer > 0 then
                        model.phoneUsageTimer - 1
                    else
                        0

                beerUsageTimer =
                    if model.beerUsageTimer > 0 then
                        model.beerUsageTimer - 1
                    else
                        0

                storyTimer =
                    case model.storyTimer of
                        Just timer ->
                            Just (timer - 1)

                        Nothing ->
                            Nothing

                storyDescriptionTimer =
                    case model.storyDescriptionTimer of
                        Just timer ->
                            Just (timer - 1)

                        Nothing ->
                            Nothing
            in
                { model
                    | energy = energy
                    , time = model.time + (1 * minutesPerSecond)
                    , phoneUsageTimer = phoneUsageTimer
                    , beerUsageTimer = beerUsageTimer
                    , storyTimer = storyTimer
                    , storyDescriptionTimer = storyDescriptionTimer
                }

        TickMinute time ->
            let
                drunkenness =
                    if model.drunkenness > 0 then
                        model.drunkenness - 1
                    else
                        0
            in
                { model
                    | drunkenness = drunkenness
                    , phoneBattery = model.phoneBattery - 1
                }

        UsePhone ->
            { model
                | phoneBattery = model.phoneBattery - 1
                , phoneUsageTimer = 3
            }

        DrinkBeer ->
            let
                drunkIncrement =
                    if model.drunkenness < 4 then
                        1
                    else
                        floor ((toFloat model.drunkenness) / 4.0)

                newModel =
                    { model
                        | drunkenness = model.drunkenness + drunkIncrement
                        , confidence = model.confidence + 1
                        , beerUsageTimer = 10
                        , storyHasDrunkBeer = True
                    }
            in
                if model.storyHasDrunkBeer then
                    newModel
                else
                    update (GoToStoryBeat "drinkBeerFirstTime") newModel

        GoToStoryBeat storyKey ->
            let
                maybeStoryBeat =
                    getStoryBeat storyKey

                storyTimer =
                    case maybeStoryBeat of
                        Just beat ->
                            case beat.timeUntil of
                                Just ( time, _ ) ->
                                    Just time

                                Nothing ->
                                    Nothing

                        Nothing ->
                            Nothing

                storyDescriptionTimer =
                    case maybeStoryBeat of
                        Just beat ->
                            beat.clearDescriptionAfter

                        Nothing ->
                            Nothing
            in
                { model
                    | storyKey = storyKey
                    , storyTimer = storyTimer
                    , storyDescriptionTimer = storyDescriptionTimer
                }



-- SUBSCRPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ every
            (if debug then
                millisecond
             else
                second
            )
            Tick
        , every (second * 60) TickMinute
        ]



-- STORY


type alias StoryBeat =
    { description : String
    , clearDescriptionAfter : Maybe Int
    , actions : List ( String, String )
    , timeUntil : Maybe ( Int, String )
    , canUsePhone : Bool
    , phoneHasMessage : Bool
    , canDrinkBeer : Bool
    , playerPosition : Int
    , simonPosition : ( Int, Int )
    , annaPosition : ( Int, Int )
    , mehmetPosition : ( Int, Int )
    , pollyPosition : ( Int, Int )
    }


story : Dict String StoryBeat
story =
    Dict.fromList
        [ arriveAtParty
        , enterParty
        , playWithPhone
        , simonOffersBeer
        , takeTheBeer
        , drinkBeerFirstTime
        , weirdCarpet
        , messageFromSimon
        , yeahMateFine
        , askHowLong
        ]


defaultStoryBeat : StoryBeat
defaultStoryBeat =
    StoryBeat ""
        Nothing
        []
        Nothing
        False
        False
        False
        29
        ( 60, 18 )
        ( 56, 13 )
        ( 62, 7 )
        ( 69, 12 )


withDescription : String -> StoryBeat -> StoryBeat
withDescription description beat =
    { beat | description = description }


withClearDescriptionAfter : Int -> StoryBeat -> StoryBeat
withClearDescriptionAfter time beat =
    { beat | clearDescriptionAfter = Just time }


withActions : List ( String, String ) -> StoryBeat -> StoryBeat
withActions actions beat =
    { beat | actions = actions }


withTimeUntil : Int -> String -> StoryBeat -> StoryBeat
withTimeUntil time next beat =
    { beat | timeUntil = Just ( time, next ) }


withCanUsePhone : StoryBeat -> StoryBeat
withCanUsePhone beat =
    { beat | canUsePhone = True }


withCanDrinkBeer : StoryBeat -> StoryBeat
withCanDrinkBeer beat =
    { beat | canDrinkBeer = True }


withPlayerPosition : Int -> StoryBeat -> StoryBeat
withPlayerPosition playerPosition beat =
    { beat | playerPosition = playerPosition }


withSimonPosition : Int -> Int -> StoryBeat -> StoryBeat
withSimonPosition x y beat =
    { beat | simonPosition = ( x, y ) }


arriveAtParty : ( String, StoryBeat )
arriveAtParty =
    ( "arriveAtParty"
    , defaultStoryBeat
        |> withDescription
            ("You arrive at the party. You hope you can make it to the end "
                ++ "before your phone runs out of power. And before you run "
                ++ "out of energy."
            )
        |> withActions [ ( "Go into the house", "enterParty" ) ]
        |> withPlayerPosition 2
    )


enterParty : ( String, StoryBeat )
enterParty =
    ( "enterParty"
    , defaultStoryBeat
        |> withDescription "You enter the house and find a wall to lean on."
        |> withTimeUntil 3 "playWithPhone"
    )


playWithPhone : ( String, StoryBeat )
playWithPhone =
    ( "playWithPhone"
    , defaultStoryBeat
        |> withDescription
            ("You turn on your phone to pretend you are busy. It'll keep you "
                ++ "from getting drained from talking to too many people."
            )
        |> withTimeUntil 10 "simonOffersBeer"
        |> withCanUsePhone
    )


simonOffersBeer : ( String, StoryBeat )
simonOffersBeer =
    ( "simonOffersBeer"
    , defaultStoryBeat
        |> withDescription "Your friend, Simon, comes over and offers you a beer."
        |> withActions [ ( "Take the beer", "takeTheBeer" ) ]
        |> withSimonPosition 39 18
    )


takeTheBeer : ( String, StoryBeat )
takeTheBeer =
    ( "takeTheBeer"
    , defaultStoryBeat
        |> withDescription
            ("You take the beer. Its wet surface dampens your hand. You hold it "
                ++ "up to your mouth and feel the coldness on your lips."
            )
        |> withCanDrinkBeer
        |> withSimonPosition 39 18
    )


drinkBeerFirstTime : ( String, StoryBeat )
drinkBeerFirstTime =
    ( "drinkBeerFirstTime"
    , defaultStoryBeat
        |> withDescription
            ("You don't like its bitter taste, you're more of a rum person. But, "
                ++ "enough of this, and hey, you may work up the courage to talk to "
                ++ "someone new. Or so you tell yourself."
            )
        |> withTimeUntil 19 "weirdCarpet"
        |> withClearDescriptionAfter 13
        |> withCanUsePhone
        |> withCanDrinkBeer
    )


weirdCarpet : ( String, StoryBeat )
weirdCarpet =
    ( "weirdCarpet"
    , defaultStoryBeat
        |> withDescription "That carpet is weird. And pretty disgusting."
        |> withClearDescriptionAfter 4
        |> withCanUsePhone
        |> withCanDrinkBeer
        |> withTimeUntil 15 "messageFromSimon"
    )


messageFromSimon : ( String, StoryBeat )
messageFromSimon =
    ( "messageFromSimon"
    , defaultStoryBeat
        |> withDescription "Simon sent you a WhatsApp, \"Hey mate, you alright over there?\""
        |> withActions
            [ ( "\"Yeah mate fine :)\"", "yeahMateFine" )
            , ( "\"How long we gunna be here?\"", "askHowLong" )
            ]
    )


yeahMateFine : ( String, StoryBeat )
yeahMateFine =
    ( "yeahMateFine"
    , defaultStoryBeat
        |> withDescription "\"Cool cool, btw we'll probably head off about 2am\""
        |> withClearDescriptionAfter 4
        |> withCanUsePhone
        |> withCanDrinkBeer
    )


askHowLong : ( String, StoryBeat )
askHowLong =
    ( "askHowLong"
    , defaultStoryBeat
        |> withDescription "\"Err, till 2am probs\""
        |> withClearDescriptionAfter 4
        |> withCanUsePhone
        |> withCanDrinkBeer
    )
