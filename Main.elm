port module Main exposing (..)

import Debug
import Dict exposing (Dict)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)
import Maybe.Extra
import Octicons as Icon
import Random
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
        , update = updateWithCmds
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
    , drunkOffsetX : Float
    , drunkOffsetY : Float
    , drinkUsageTimer : Int
    , danceOffset : Float
    , storyKey : String
    , storyTimer : Maybe Int
    , storyDescriptionTimer : Maybe Int
    , storyHasDrunkBeer : Bool
    , storyHasMessage : Bool
    , storyDrinkType : DrinkType
    }


type DrinkType
    = Beer
    | Rum


init : ( Model, Cmd Msg )
init =
    ( Model
        maxEnergy
        50
        0
        90
        0
        0
        0
        0
        0
        0
        "arriveAtParty"
        Nothing
        -- "thinkAboutDancingWithRum"
        -- (Just 0)
        Nothing
        False
        False
        Beer
    , Cmd.none
    )


minutesPerSecond : Float
minutesPerSecond =
    1


hourStart : Int
hourStart =
    22


hourFinish : Int
hourFinish =
    26


maxEnergy : Int
maxEnergy =
    ((hourFinish - hourStart - 1) * 60 |> toFloat) * minutesPerSecond |> floor


maxConfidence : Int
maxConfidence =
    100


getStoryBeat : String -> Maybe StoryBeat
getStoryBeat storyKey =
    Dict.get storyKey story


getPlayerPosition : Model -> ( Int, Int )
getPlayerPosition model =
    let
        maybeBeat =
            getStoryBeat model.storyKey

        ( x, y ) =
            Maybe.Extra.unwrap
                ( 29, 0 )
                (\beat -> beat.playerPosition)
                maybeBeat
    in
        ( x, y )



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

        confidenceRatio =
            (toFloat model.confidence) / (toFloat maxConfidence)

        energyRatio =
            (toFloat model.energy) / (toFloat maxEnergy)

        scaleColourConfidence : Float -> Float -> String
        scaleColourConfidence start max =
            toString (floor (max - ((max - start) * confidenceRatio)))

        scaleColourEnergy : Float -> Float -> String
        scaleColourEnergy start min =
            toString (floor (min + ((start - min) * energyRatio)))

        radialCenterR =
            scaleColourConfidence 241 255

        radialCenterG =
            scaleColourConfidence 94 255

        radialCenterB =
            scaleColourConfidence 81 255

        radialCenterA =
            toString (1 - ((1 - 0.47) * confidenceRatio))

        radialCenterRGBA =
            radialCenterR ++ "," ++ radialCenterG ++ "," ++ radialCenterB ++ "," ++ radialCenterA

        radialOuterR =
            scaleColourEnergy 70 0

        radialOuterG =
            scaleColourEnergy 60 0

        radialOuterB =
            scaleColourEnergy 60 0

        radialOuterA =
            toString (1 - ((1 - 0.47) * energyRatio))

        radialOuterRGBA =
            radialOuterR ++ "," ++ radialOuterG ++ "," ++ radialOuterB ++ "," ++ radialOuterA

        circleSize =
            toString (40 + ((100 - 40) * energyRatio))

        ( circleX, _ ) =
            -- getPlayerPosition model
            ( 29, 0 )
    in
        div
            [ style
                [ ( "background-image"
                  , ("radial-gradient("
                        ++ "circle at "
                        ++ (toString (circleX + 4))
                        ++ "vw"
                        ++ " 33%, "
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
            , viewSimon model.danceOffset storyBeat
            , viewAnna model.danceOffset storyBeat
            , viewPolly model.danceOffset storyBeat
            , viewMehmet model.danceOffset storyBeat
            , viewBackgroundPeople model.danceOffset
            , viewPartyLights model.time
            , viewPhone model.phoneUsageTimer model.drunkOffsetX model.drunkOffsetY model.drunkenness storyBeat
            , viewDrink model.drinkUsageTimer model.drunkOffsetX model.drunkOffsetY model.drunkenness model.storyDrinkType storyBeat
            , viewPhoneBattery model.phoneBattery
            , viewPhoneClock model.time
            , viewPhoneDataConnection
            , viewPhoneNetworkConnection
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
            , ( "transition", "height 1s linear" )
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
            , ( "top", "25px" )
            , ( "right", "25px" )
            , ( "width", "120px" )
            , ( "padding", "2px" )
            , ( "border", "2px solid #ffffff" )
            , ( "border-radius", "6px" )
            ]
        ]
        [ div
            [ style
                [ ( "background", "#ffffff" )
                , ( "border-radius", "3px" )
                , ( "height", "25px" )
                , ( "width", (toString phoneBattery) ++ "%" )
                ]
            ]
            []
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
                , ( "top", "31px" )
                , ( "right", "160px" )
                , ( "font-family", "Courier" )
                , ( "font-size", "1.3rem" )
                ]
            ]
            [ text (hoursString ++ ":" ++ minutes) ]


viewPhoneDataConnection : Html Msg
viewPhoneDataConnection =
    div
        [ style
            [ ( "position", "absolute" )
            , ( "top", "31px" )
            , ( "right", "240px" )
            , ( "font-family", "Courier" )
            , ( "font-size", "1.3rem" )
            ]
        ]
        [ text "4G" ]


viewPhoneNetworkConnection : Html Msg
viewPhoneNetworkConnection =
    let
        bar x height colour =
            div
                [ style
                    [ ( "position", "absolute" )
                    , ( "bottom", "0" )
                    , ( "left", (toString (x * 6)) ++ "px" )
                    , ( "background", colour )
                    , ( "height", (toString (height * 4)) ++ "px" )
                    , ( "width", "4px" )
                    ]
                ]
                []
    in
        div
            [ style
                [ ( "position", "absolute" )
                , ( "top", "49px" )
                , ( "right", "310px" )
                ]
            ]
            [ bar 1 1 "white"
            , bar 2 2 "white"
            , bar 3 3 "white"
            , bar 4 4 "grey"
            ]


viewDrunkenness : Int -> Html Msg
viewDrunkenness drunkenness =
    div [] [ text ("Drunkenness " ++ (toString drunkenness)) ]


viewPlayer : Int -> StoryBeat -> Html Msg
viewPlayer energy storyBeat =
    let
        ( x, customY ) =
            storyBeat.playerPosition

        y =
            if customY == 0 then
                energy |> floorHeight |> floor |> (+) -3
            else
                customY
    in
        viewPerson 0
            0
            [ ( "bottom", (toString y) ++ "vh" )
            , ( "left", (toString x) ++ "vw" )
            , ( "background", "#333333" )
            ]


viewSimon : Float -> StoryBeat -> Html Msg
viewSimon danceOffset storyBeat =
    let
        ( x, y ) =
            storyBeat.simonPosition
    in
        viewPerson 0.8
            danceOffset
            [ ( "bottom", (toString y) ++ "vh" )
            , ( "left", (toString x) ++ "vw" )
            , ( "background", "#42B859" )
            ]


viewAnna : Float -> StoryBeat -> Html Msg
viewAnna danceOffset storyBeat =
    let
        ( x, y ) =
            storyBeat.annaPosition
    in
        viewPerson -0.3
            danceOffset
            [ ( "bottom", (toString y) ++ "vh" )
            , ( "left", (toString x) ++ "vw" )
            , ( "background", "#B8B442" )
            ]


viewMehmet : Float -> StoryBeat -> Html Msg
viewMehmet danceOffset storyBeat =
    let
        ( x, y ) =
            storyBeat.mehmetPosition
    in
        viewPerson -0.4
            danceOffset
            [ ( "bottom", (toString y) ++ "vh" )
            , ( "left", (toString x) ++ "vw" )
            , ( "background", "#B44A3F" )
            ]


viewPolly : Float -> StoryBeat -> Html Msg
viewPolly danceOffset storyBeat =
    let
        ( x, y ) =
            storyBeat.pollyPosition
    in
        viewPerson 0.9
            danceOffset
            [ ( "bottom", (toString y) ++ "vh" )
            , ( "left", (toString x) ++ "vw" )
            , ( "background", "#9C31CC" )
            ]


viewBackgroundPeople : Float -> Html Msg
viewBackgroundPeople danceOffset =
    div []
        [ viewPerson 0.2 danceOffset [ ( "bottom", "18vh" ), ( "left", "-3vw" ), ( "background", "#444" ) ]
        , viewPerson -0.2 danceOffset [ ( "bottom", "15vh" ), ( "left", "-6vw" ) ]
        , viewPerson 0.1 danceOffset [ ( "bottom", "20vh" ), ( "left", "19vw" ), ( "background", "#555" ) ]
        , viewPerson -0.2 danceOffset [ ( "bottom", "22vh" ), ( "left", "10vw" ), ( "background", "#444" ) ]
        , viewPerson -0.1 danceOffset [ ( "bottom", "16vh" ), ( "left", "14vw" ) ]
        , viewPerson 0.1 danceOffset [ ( "bottom", "11vh" ), ( "left", "38vw" ), ( "background", "#444" ) ]
        , viewPerson 0.2 danceOffset [ ( "bottom", "9vh" ), ( "left", "28vw" ), ( "background", "#555" ) ]
        , viewPerson -0.1 danceOffset [ ( "bottom", "7vh" ), ( "left", "30vw" ) ]
        , viewPerson -0.2 danceOffset [ ( "bottom", "26vh" ), ( "left", "88vw" ), ( "background", "#222" ) ]
        , viewPerson -0.1 danceOffset [ ( "bottom", "24vh" ), ( "left", "92vw" ), ( "background", "#333" ) ]
        , viewPerson 0.1 danceOffset [ ( "bottom", "17vh" ), ( "left", "81vw" ), ( "background", "#444" ) ]
        , viewPerson 0.2 danceOffset [ ( "bottom", "14vh" ), ( "left", "87vw" ), ( "background", "#555" ) ]
        ]


viewPerson : Float -> Float -> List ( String, String ) -> Html Msg
viewPerson danceAmount danceOffset styles =
    let
        height =
            toString (25 + (danceAmount * danceOffset * 5))
    in
        div
            [ style <|
                [ ( "position", "absolute" )
                , ( "height", height ++ "vh" )
                , ( "width", "8vw" )
                , ( "background", "#666" )
                , ( "transition", "left 1s linear, bottom 1s linear, height 0.2s linear" )
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


viewPhone : Int -> Float -> Float -> Int -> StoryBeat -> Html Msg
viewPhone phoneUsageTimer offsetX offsetY drunkenness storyBeat =
    let
        canUsePhone =
            if phoneUsageTimer > 0 then
                False
            else
                storyBeat.canUsePhone

        top =
            toString (10.0 + (offsetY * (toFloat drunkenness) * 0.3))

        left =
            toString (10.0 + (offsetX * (toFloat drunkenness) * 0.3))
    in
        if canUsePhone then
            div
                [ style <|
                    buttonStyle
                        ++ [ ( "position", "absolute" )
                           , ( "top", top ++ "vh" )
                           , ( "left", left ++ "vw" )
                           , ( "transition", "top 1s linear, left 1s linear" )
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


viewDrink : Int -> Float -> Float -> Int -> DrinkType -> StoryBeat -> Html Msg
viewDrink drinkUsageTimer offsetX offsetY drunkenness drinkType storyBeat =
    let
        canDrink =
            if drinkUsageTimer > 0 then
                False
            else
                storyBeat.canDrink

        drinkText =
            case drinkType of
                Beer ->
                    "Drink some beer"

                Rum ->
                    "Sip your rum"

        top =
            toString (20.0 + (offsetY * (toFloat drunkenness) * 0.3))

        left =
            toString (20.0 + (offsetX * (toFloat drunkenness) * 0.3))
    in
        if canDrink then
            div
                [ style <|
                    buttonStyle
                        ++ [ ( "position", "absolute" )
                           , ( "top", top ++ "vh" )
                           , ( "left", left ++ "vw" )
                           , ( "transition", "top 1s linear, left 1s linear" )
                           ]
                , onClick Drink
                ]
                [ Icon.defaultOptions
                    |> Icon.color "white"
                    |> Icon.size 36
                    -- |> Icon.style "vertical-align"
                    |>
                        Icon.zap
                , text drinkText
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
            if String.length storyBeat.description > 0 then
                case maybeDescriptionTimer of
                    Just timer ->
                        if timer > 0 then
                            "0"
                        else
                            "-20vh"

                    Nothing ->
                        "0"
            else
                "-20vh"
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
    (66 - ((66 - 43) * ((toFloat energy) / (toFloat maxEnergy))))



-- UPDATE


type Msg
    = Tick Time
    | TickMinute Time
    | TickConfidence Time
    | TickDance Time
    | TickDrunk Time
    | UsePhone
    | Drink
    | GoToStoryBeat String
    | UpdateDanceOffset Float
    | UpdateDrunkOffsetX Float
    | UpdateDrunkOffsetY Float


updateWithCmds : Msg -> Model -> ( Model, Cmd Msg )
updateWithCmds msg model =
    let
        newModel =
            updateWithStoryTimer msg model
    in
        case msg of
            TickDance time ->
                ( newModel, Random.generate UpdateDanceOffset (Random.float 0 1) )

            TickDrunk time ->
                ( newModel
                , Cmd.batch
                    [ Random.generate UpdateDrunkOffsetX (Random.float 0 1)
                    , Random.generate UpdateDrunkOffsetY (Random.float 0 1)
                    ]
                )

            UsePhone ->
                ( newModel, playMessagingSound () )

            _ ->
                ( newModel, Cmd.none )


updateWithStoryTimer : Msg -> Model -> Model
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
        unwrap applyStoryTimer newModel.storyTimer


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

                drinkUsageTimer =
                    if model.drinkUsageTimer > 0 then
                        model.drinkUsageTimer - 1
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
                    , drinkUsageTimer = drinkUsageTimer
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

        TickConfidence time ->
            let
                confidence =
                    if model.confidence > 0 then
                        model.confidence - 1
                    else
                        model.confidence
            in
                { model | confidence = confidence }

        TickDance time ->
            model

        TickDrunk time ->
            model

        UsePhone ->
            { model
                | phoneBattery = model.phoneBattery - 2
                , phoneUsageTimer = 6
            }

        Drink ->
            let
                drunkIncrement =
                    if model.drunkenness == 0 then
                        1
                    else
                        model.drunkenness

                -- if model.drunkenness < 2 then
                --     1
                -- else
                --     floor ((toFloat model.drunkenness) / 2.0)
                newModel =
                    { model
                        | drunkenness = model.drunkenness + drunkIncrement
                        , confidence = model.confidence + 1
                        , drinkUsageTimer = 10
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

                confidence =
                    case maybeStoryBeat of
                        Just beat ->
                            model.confidence + beat.confidenceBoost

                        Nothing ->
                            model.confidence

                energy =
                    Maybe.Extra.unwrap
                        model.energy
                        (\beat -> model.energy + beat.energyBoost)
                        maybeStoryBeat

                storyDrinkType =
                    Maybe.Extra.unwrap
                        model.storyDrinkType
                        (\beat ->
                            Maybe.Extra.unwrap
                                model.storyDrinkType
                                (\drinkType -> drinkType)
                                beat.changeDrinkType
                        )
                        maybeStoryBeat
            in
                { model
                    | energy = energy
                    , confidence = confidence
                    , storyKey = storyKey
                    , storyTimer = storyTimer
                    , storyDescriptionTimer = storyDescriptionTimer
                    , storyDrinkType = storyDrinkType
                }

        UpdateDanceOffset danceOffset ->
            { model | danceOffset = danceOffset }

        UpdateDrunkOffsetX drunkOffsetX ->
            { model | drunkOffsetX = drunkOffsetX }

        UpdateDrunkOffsetY drunkOffsetY ->
            { model | drunkOffsetY = drunkOffsetY }



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
        , every (second * 3) TickConfidence
        , every (millisecond * 200) TickDance
        , every (millisecond * 600) TickDrunk
        ]


port playMessagingSound : () -> Cmd msg



-- STORY


type alias StoryBeat =
    { description : String
    , clearDescriptionAfter : Maybe Int
    , actions : List ( String, String )
    , timeUntil : Maybe ( Int, String )
    , canUsePhone : Bool
    , phoneHasMessage : Bool
    , canDrink : Bool
    , confidenceBoost : Int
    , energyBoost : Int
    , changeDrinkType : Maybe DrinkType
    , playerPosition : ( Int, Int )
    , simonPosition : ( Int, Int )
    , annaPosition : ( Int, Int )
    , mehmetPosition : ( Int, Int )
    , pollyPosition : ( Int, Int )
    }


defaultStoryBeat : StoryBeat
defaultStoryBeat =
    StoryBeat ""
        Nothing
        []
        Nothing
        False
        False
        False
        0
        0
        Nothing
        ( 29, 0 )
        ( 60, 28 )
        ( 56, 23 )
        ( 62, 17 )
        ( 69, 22 )


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


withCanDrink : StoryBeat -> StoryBeat
withCanDrink beat =
    { beat | canDrink = True }


withConfidenceBoost : Int -> StoryBeat -> StoryBeat
withConfidenceBoost confidenceBoost beat =
    { beat | confidenceBoost = confidenceBoost }


withEnergyBoost : Int -> StoryBeat -> StoryBeat
withEnergyBoost energyBoost beat =
    { beat | energyBoost = energyBoost }


withChangeDrinkType : DrinkType -> StoryBeat -> StoryBeat
withChangeDrinkType drinkType beat =
    { beat | changeDrinkType = Just drinkType }


withPlayerPosition : Int -> Int -> StoryBeat -> StoryBeat
withPlayerPosition x y beat =
    { beat | playerPosition = ( x, y ) }


withSimonPosition : Int -> Int -> StoryBeat -> StoryBeat
withSimonPosition x y beat =
    { beat | simonPosition = ( x, y ) }


withAnnaPosition : Int -> Int -> StoryBeat -> StoryBeat
withAnnaPosition x y beat =
    { beat | annaPosition = ( x, y ) }


withMehmetPosition : Int -> Int -> StoryBeat -> StoryBeat
withMehmetPosition x y beat =
    { beat | mehmetPosition = ( x, y ) }


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
        , simonIntroducesAnna
        , heyAnna
        , ummAnna
        , danceWithAnna
        , tiredFromDancing
        , keepDancing
        , restFromDancing
        , avoidDanceWithAnna
        , mehmetIntroducesHimself
        , notMyThing
        , yeahItsFun
        , askForACarlsberg
        , mehmetBringsCarlsberg
        , drinkYourCarlsberg
        , thinkAboutDancing
        , askForARum
        , comeBackWithRum
        , thinkAboutDancingWithRum
        , turnDownDrink
        , thirsty
        , getACarlsberg
        , getARum
        , goDanceWithPolly
        , musicSwells
        , tapFoot
        , pollyDances
        , copyPollysDanceMoves
        , restFromDancingWithPolly
        , hangBack
        , dadDancing
        , feetHurt
        , spillDrink
        , tryToKeepDancing
        , mehmetTakesABreakWithYou
        , takeABreak
        , chatWithMehmet
        , askAboutWallflower
        , avoidAndGoHome
        , shouldHangOut
        , hangOutNextWeek
        , imBusy
        , simonCallsItANight
        , readInterestingArticle
        , continueReadingArticle
        , finishReadingArticle
        , lookAtFunnyPictures
        , continueLookingAtPictures
        , simonAsksToDance
        , getAnUberHome
        ]


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
        |> withPlayerPosition 3 34
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
        |> withSimonPosition 39 36
    )


takeTheBeer : ( String, StoryBeat )
takeTheBeer =
    ( "takeTheBeer"
    , defaultStoryBeat
        |> withDescription
            ("You take the beer. The wet glass dampens your hand. You hold it "
                ++ "up to your mouth and feel the coldness on your lips."
            )
        |> withCanDrink
        |> withSimonPosition 39 36
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
        |> withTimeUntil 12 "weirdCarpet"
        |> withClearDescriptionAfter 8
        |> withConfidenceBoost 10
        |> withCanUsePhone
        |> withCanDrink
    )


weirdCarpet : ( String, StoryBeat )
weirdCarpet =
    ( "weirdCarpet"
    , defaultStoryBeat
        |> withDescription
            ("The carpet squelches as you shift your balance. The decor in "
                ++ " this place is weird. And pretty disgusting."
            )
        |> withClearDescriptionAfter 6
        |> withCanUsePhone
        |> withCanDrink
        |> withTimeUntil 8 "messageFromSimon"
    )


messageFromSimon : ( String, StoryBeat )
messageFromSimon =
    ( "messageFromSimon"
    , defaultStoryBeat
        |> withDescription "Simon sent you a message, \"Hey mate, you alright over there?\""
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
        |> withTimeUntil 8 "simonIntroducesAnna"
        |> withCanUsePhone
        |> withCanDrink
    )


askHowLong : ( String, StoryBeat )
askHowLong =
    ( "askHowLong"
    , defaultStoryBeat
        |> withDescription "\"Err, till 2am probs\""
        |> withConfidenceBoost -10
        |> withClearDescriptionAfter 4
        |> withTimeUntil 12 "simonIntroducesAnna"
        |> withCanUsePhone
        |> withCanDrink
    )


simonIntroducesAnna : ( String, StoryBeat )
simonIntroducesAnna =
    ( "simonIntroducesAnna"
    , defaultStoryBeat
        |> withDescription
            ("\"Bruv, this is Anna,\" says Simon. \"Anna, this is my friend "
                ++ "I was telling you about.\""
            )
        |> withActions
            [ ( "\"Hey Anna, alright?\"", "heyAnna" )
            , ( "\"Umm, hi.\"", "ummAnna" )
            ]
        -- |> withTimeUntil 8 "ignoredThem"
        |>
            withSimonPosition 42 40
        |> withAnnaPosition 39 36
        |> withCanDrink
    )


heyAnna : ( String, StoryBeat )
heyAnna =
    ( "heyAnna"
    , defaultStoryBeat
        |> withDescription "\"I'm great thanks. This party is well fun. Why don't you come dance?\""
        |> withActions
            [ ( "\"Ok, why not.\"", "danceWithAnna" )
            , ( "\"A bit later, perhaps.\"", "avoidDanceWithAnna" )
            ]
        |> withConfidenceBoost 20
        |> withAnnaPosition 39 36
        |> withCanDrink
    )


ummAnna : ( String, StoryBeat )
ummAnna =
    ( "ummAnna"
    , defaultStoryBeat
        |> withDescription "\"Hi, err, do you want to dance with us?\" she asks."
        |> withActions
            [ ( "\"Ok, why not.\"", "danceWithAnna" )
            , ( "\"A bit later, perhaps.\"", "avoidDanceWithAnna" )
            ]
        |> withSimonPosition 42 40
        |> withAnnaPosition 39 36
        |> withCanDrink
        |> withCanUsePhone
    )


danceWithAnna : ( String, StoryBeat )
danceWithAnna =
    ( "danceWithAnna"
    , defaultStoryBeat
        |> withConfidenceBoost 10
        |> withCanDrink
        |> withTimeUntil 8 "tiredFromDancing"
        |> withPlayerPosition 58 28
        |> withSimonPosition 68 26
    )


tiredFromDancing : ( String, StoryBeat )
tiredFromDancing =
    ( "tiredFromDancing"
    , defaultStoryBeat
        |> withDescription "You're getting pretty tired from this dancing."
        |> withActions
            [ ( "Keep dancing.", "keepDancing" )
            , ( "Take a rest.", "restFromDancing" )
            ]
        |> withPlayerPosition 58 28
        |> withSimonPosition 68 26
    )


keepDancing : ( String, StoryBeat )
keepDancing =
    ( "keepDancing"
    , defaultStoryBeat
        |> withConfidenceBoost 3
        |> withTimeUntil 8 "tiredFromDancing"
        |> withCanDrink
        |> withPlayerPosition 58 28
        |> withSimonPosition 68 26
    )


restFromDancing : ( String, StoryBeat )
restFromDancing =
    ( "restFromDancing"
    , defaultStoryBeat
        |> withTimeUntil 8 "mehmetIntroducesHimself"
        |> withCanUsePhone
        |> withCanDrink
    )


avoidDanceWithAnna : ( String, StoryBeat )
avoidDanceWithAnna =
    ( "avoidDanceWithAnna"
    , defaultStoryBeat
    )


mehmetIntroducesHimself : ( String, StoryBeat )
mehmetIntroducesHimself =
    ( "mehmetIntroducesHimself"
    , defaultStoryBeat
        |> withDescription
            ("Mehmet jives over next to you, \"Dude, we've got some sick moves out there.\"")
        |> withActions
            [ ( "\"It's not really my thing.\"", "notMyThing" )
            , ( "\"Yeah man, it's fun.\"", "yeahItsFun" )
            ]
        -- |> withTimeUntil 8 "ignoredThem"
        |>
            withMehmetPosition 38 37
    )


notMyThing : ( String, StoryBeat )
notMyThing =
    ( "notMyThing"
    , defaultStoryBeat
        |> withDescription "\"Oh bruv, looks like you're low, want another beer?\", he asks."
        |> withActions
            [ ( "\"Yeah a Carlsberg or something, cheers mate.\"", "askForACarlsberg" )
            , ( "\"Actually, you reckon they've got rum?\"", "askForARum" )
            , ( "\"I'm ok, thanks\"", "turnDownDrink" )
            ]
        |> withMehmetPosition 42 40
    )


yeahItsFun : ( String, StoryBeat )
yeahItsFun =
    ( "yeahItsFun"
    , defaultStoryBeat
        |> withDescription "\"Oh bruv, looks like you're low, want another beer?\", he asks."
        |> withActions
            [ ( "\"Yeah a Carlsberg or something, cheers mate.\"", "askForACarlsberg" )
            , ( "\"Actually, you reckon they've got rum?\"", "askForARum" )
            ]
        |> withConfidenceBoost 5
        |> withMehmetPosition 38 37
    )


askForACarlsberg : ( String, StoryBeat )
askForACarlsberg =
    ( "askForACarlsberg"
    , defaultStoryBeat
        |> withDescription "\"Righto bruv, two ticks.\""
        |> withMehmetPosition 120 28
        |> withTimeUntil 6 "mehmetBringsCarlsberg"
        |> withCanUsePhone
    )


mehmetBringsCarlsberg : ( String, StoryBeat )
mehmetBringsCarlsberg =
    ( "mehmetBringsCarlsberg"
    , defaultStoryBeat
        |> withDescription "\"Catch you later bruv.\""
        |> withActions [ ( "\"Yeah mate, thanks for the drink.\"", "drinkYourCarlsberg" ) ]
        |> withMehmetPosition 38 37
    )


drinkYourCarlsberg : ( String, StoryBeat )
drinkYourCarlsberg =
    ( "drinkYourCarlsberg"
    , defaultStoryBeat
        |> withCanDrink
        |> withCanUsePhone
        |> withTimeUntil 8 "thinkAboutDancing"
    )


thinkAboutDancing : ( String, StoryBeat )
thinkAboutDancing =
    ( "thinkAboutDancing"
    , defaultStoryBeat
        |> withDescription "You think about going to dance again."
        |> withActions
            [ ( "Go dance.", "goDanceWithPolly" )
            , ( "Hang back.", "hangBack" )
            ]
    )


askForARum : ( String, StoryBeat )
askForARum =
    ( "askForARum"
    , defaultStoryBeat
        |> withDescription
            ("Mehmet claps you on the back, \"I like your style,\" he grins "
                ++ "like a madman as you walk over to the drinks table."
            )
        |> withConfidenceBoost 5
        |> withMehmetPosition 120 28
        |> withPlayerPosition 120 34
        |> withTimeUntil 6 "comeBackWithRum"
    )


comeBackWithRum : ( String, StoryBeat )
comeBackWithRum =
    ( "comeBackWithRum"
    , defaultStoryBeat
        |> withCanDrink
        |> withCanUsePhone
        |> withChangeDrinkType Rum
        |> withTimeUntil 8 "thinkAboutDancingWithRum"
    )


thinkAboutDancingWithRum : ( String, StoryBeat )
thinkAboutDancingWithRum =
    ( "thinkAboutDancingWithRum"
    , defaultStoryBeat
        |> withDescription "You think you could probably dance with your rum in one hand."
        |> withActions
            [ ( "Go dance.", "goDanceWithPolly" )
            , ( "Hang back.", "hangBack" )
            ]
    )


goDanceWithPolly : ( String, StoryBeat )
goDanceWithPolly =
    ( "goDanceWithPolly"
    , defaultStoryBeat
        |> withTimeUntil 4 "musicSwells"
        |> withPlayerPosition 68 28
        |> withSimonPosition 58 28
        |> withEnergyBoost -5
    )


musicSwells : ( String, StoryBeat )
musicSwells =
    ( "musicSwells"
    , defaultStoryBeat
        |> withDescription
            ("The music swells, you feel its rhythm in your bones as you close your eyes.")
        |> withActions [ ( "Tap your foot.", "tapFoot" ) ]
        |> withPlayerPosition 68 28
        |> withSimonPosition 58 28
    )


tapFoot : ( String, StoryBeat )
tapFoot =
    ( "tapFoot"
    , defaultStoryBeat
        |> withDescription "Tap. Tap tap."
        |> withEnergyBoost -5
        |> withClearDescriptionAfter 3
        |> withTimeUntil 6 "pollyDances"
        |> withPlayerPosition 68 28
        |> withSimonPosition 58 28
    )


pollyDances : ( String, StoryBeat )
pollyDances =
    ( "pollyDances"
    , defaultStoryBeat
        |> withDescription "You open your eyes, Polly is looking at you, shimmying left and right."
        |> withActions
            [ ( "Copy Polly's dance moves.", "copyPollysDanceMoves" )
            , ( "Take a break", "restFromDancingWithPolly" )
            ]
        |> withCanDrink
        |> withConfidenceBoost 5
        |> withEnergyBoost -5
        |> withPlayerPosition 68 28
        |> withSimonPosition 58 28
    )


copyPollysDanceMoves : ( String, StoryBeat )
copyPollysDanceMoves =
    ( "copyPollysDanceMoves"
    , defaultStoryBeat
        |> withDescription "copyPollysDanceMoves"
        |> withTimeUntil 8 "dadDancing"
        |> withCanDrink
        |> withConfidenceBoost 5
        |> withEnergyBoost -5
        |> withPlayerPosition 68 28
        |> withSimonPosition 58 28
    )


dadDancing : ( String, StoryBeat )
dadDancing =
    ( "dadDancing"
    , defaultStoryBeat
        |> withDescription "dadDancing"
        |> withTimeUntil 6 "feetHurt"
    )


feetHurt : ( String, StoryBeat )
feetHurt =
    ( "feetHurt"
    , defaultStoryBeat
        |> withDescription "feetHurt"
        |> withActions
            [ ( "spillDrink", "spillDrink" )
            , ( "__untitled__", "__untitled__" )
            ]
    )


spillDrink : ( String, StoryBeat )
spillDrink =
    ( "spillDrink"
    , defaultStoryBeat
        |> withDescription "spillDrink"
        |> withActions
            [ ( "tryToKeepDancing", "tryToKeepDancing" )
            , ( "takeABreak", "takeABreak" )
            ]
    )


tryToKeepDancing : ( String, StoryBeat )
tryToKeepDancing =
    ( "tryToKeepDancing"
    , defaultStoryBeat
        |> withDescription "tryToKeepDancing"
        |> withTimeUntil 8 "mehmetTakesABreakWithYou"
    )


takeABreak : ( String, StoryBeat )
takeABreak =
    ( "takeABreak"
    , defaultStoryBeat
        |> withDescription "takeABreak"
        |> withTimeUntil 4 "chatWithMehmet"
    )


mehmetTakesABreakWithYou : ( String, StoryBeat )
mehmetTakesABreakWithYou =
    ( "mehmetTakesABreakWithYou"
    , defaultStoryBeat
        |> withDescription "mehmetTakesABreakWithYou"
        |> withTimeUntil 4 "chatWithMehmet"
    )


chatWithMehmet : ( String, StoryBeat )
chatWithMehmet =
    ( "chatWithMehmet"
    , defaultStoryBeat
        |> withDescription "chatWithMehmet"
        |> withActions [ ( "askAboutWallflower", "askAboutWallflower" ) ]
    )


askAboutWallflower : ( String, StoryBeat )
askAboutWallflower =
    ( "askAboutWallflower"
    , defaultStoryBeat
        |> withDescription "askAboutWallflower"
        |> withActions
            [ ( "avoidAndGoHome", "avoidAndGoHome" )
            , ( "shouldHangOut", "shouldHangOut" )
            ]
    )


shouldHangOut : ( String, StoryBeat )
shouldHangOut =
    ( "shouldHangOut"
    , defaultStoryBeat
        |> withDescription "shouldHangOut"
        |> withActions
            [ ( "hangOutNextWeek", "hangOutNextWeek" )
            , ( "imBusy", "imBusy" )
            ]
    )


hangOutNextWeek : ( String, StoryBeat )
hangOutNextWeek =
    ( "hangOutNextWeek"
    , defaultStoryBeat
        |> withDescription "hangOutNextWeek"
        |> withTimeUntil 6 "simonCallsItANight"
    )


imBusy : ( String, StoryBeat )
imBusy =
    ( "imBusy"
    , defaultStoryBeat
        |> withDescription "imBusy"
        |> withTimeUntil 8 "simonCallsItANight"
    )


simonCallsItANight : ( String, StoryBeat )
simonCallsItANight =
    ( "simonCallsItANight"
    , defaultStoryBeat
        |> withDescription "simonCallsItANight"
        |> withActions [ ( "home", "home" ) ]
    )


avoidAndGoHome : ( String, StoryBeat )
avoidAndGoHome =
    ( "avoidAndGoHome"
    , defaultStoryBeat
        |> withDescription "avoidAndGoHome"
        |> withActions [ ( "home", "home" ) ]
    )


restFromDancingWithPolly : ( String, StoryBeat )
restFromDancingWithPolly =
    ( "restFromDancingWithPolly"
    , defaultStoryBeat
        |> withDescription "restFromDancingWithPolly"
        |> withCanDrink
        |> withCanUsePhone
        |> withConfidenceBoost -5
        |> withEnergyBoost 10
    )


hangBack : ( String, StoryBeat )
hangBack =
    ( "hangBack"
    , defaultStoryBeat
        |> withDescription "hangBack"
        |> withEnergyBoost 10
        |> withTimeUntil 8 "readInterestingArticle"
    )


turnDownDrink : ( String, StoryBeat )
turnDownDrink =
    ( "turnDownDrink"
    , defaultStoryBeat
        |> withDescription "turnDownDrink"
        |> withTimeUntil 8 "thirsty"
        |> withCanUsePhone
    )


thirsty : ( String, StoryBeat )
thirsty =
    ( "thirsty"
    , defaultStoryBeat
        |> withDescription "thirsty"
        |> withActions
            [ ( "getACarlsberg", "getACarlsberg" )
            , ( "getARum", "getARum" )
            ]
    )


getACarlsberg : ( String, StoryBeat )
getACarlsberg =
    ( "getACarlsberg"
    , defaultStoryBeat
        |> withDescription "getACarlsberg"
        |> withTimeUntil 8 "thinkAboutDancing"
    )


getARum : ( String, StoryBeat )
getARum =
    ( "getARum"
    , defaultStoryBeat
        |> withDescription "getARum"
        |> withTimeUntil 8 "thinkAboutDancingWithRum"
    )


readInterestingArticle : ( String, StoryBeat )
readInterestingArticle =
    ( "readInterestingArticle"
    , defaultStoryBeat
        |> withDescription "readInterestingArticle"
        |> withTimeUntil 4 "continueReadingArticle"
    )


continueReadingArticle : ( String, StoryBeat )
continueReadingArticle =
    ( "continueReadingArticle"
    , defaultStoryBeat
        |> withDescription "continueReadingArticle"
        |> withActions
            [ ( "finishReadingArticle", "finishReadingArticle" )
            , ( "goDanceWithPolly", "goDanceWithPolly" )
            ]
    )


finishReadingArticle : ( String, StoryBeat )
finishReadingArticle =
    ( "finishReadingArticle"
    , defaultStoryBeat
        |> withDescription "finishReadingArticle"
        |> withTimeUntil 6 "lookAtFunnyPictures"
    )


lookAtFunnyPictures : ( String, StoryBeat )
lookAtFunnyPictures =
    ( "lookAtFunnyPictures"
    , defaultStoryBeat
        |> withDescription "lookAtFunnyPictures"
        |> withTimeUntil 4 "continueLookingAtPictures"
    )


continueLookingAtPictures : ( String, StoryBeat )
continueLookingAtPictures =
    ( "continueLookingAtPictures"
    , defaultStoryBeat
        |> withDescription "continueLookingAtPictures"
        |> withActions
            [ ( "lookAtFunnyPictures", "lookAtFunnyPictures" )
            , ( "simonAsksToDance", "simonAsksToDance" )
            ]
    )


simonAsksToDance : ( String, StoryBeat )
simonAsksToDance =
    ( "simonAsksToDance"
    , defaultStoryBeat
        |> withDescription "simonAsksToDance"
        |> withActions
            [ ( "goDanceWithPolly", "goDanceWithPolly" )
            , ( "getAnUberHome", "getAnUberHome" )
            ]
    )


getAnUberHome : ( String, StoryBeat )
getAnUberHome =
    ( "getAnUberHome"
    , defaultStoryBeat
        |> withDescription "getAnUberHome"
        |> withActions
            [ ( "__untitled__", "__untitled__" )
            , ( "home", "home" )
            ]
    )



-- ignoredThem : ( String, StoryBeat )
-- ignoredThem =
--     ( "ignoredThem"
--     , defaultStoryBeat
--         |> withDescription "You ignored them."
--         |> withCanDrink
--         |> withCanUsePhone
--     )
