'use client'
import React from "react";
import {Tabs, Tab, Card, CardBody} from "@nextui-org/react";

//Icons
import { FaBookBookmark } from "react-icons/fa6";
import { MdRule, MdTipsAndUpdates } from "react-icons/md";
import { FaHandsHelping } from "react-icons/fa";

//Pages
import Guidelines from "./guidelines";
import Apostilas from "./apostilas";
import MaterialDeApoio from "./material-de-apoio";
import DicasParaAulas from "./dicas-para-aulas";

export default function Material(){
    return(
    <div className="flex flex-col items-center justify-center py-3 px-4 overflow-x-hidden overflow-y-hidden h-[90vh]">
      <Tabs aria-label="Options">
        <Tab
          key="Apostilas"
          title={
            <div className="hover:text-fluency-blue-600 hover:dark:text-fluency-blue-500 duration-300 ease-in-out transition-all flex items-center space-x-2 w-max font-bold flex-nowrap">
              <FaBookBookmark />
              <span>Apostilas</span>
            </div>
          }>
          <Card className="w-full">
            <CardBody>
                <Apostilas />
            </CardBody>
          </Card>  
        </Tab>

        <Tab
          key="Guidelines"
          title={
            <div className="hover:text-fluency-red-600 hover:dark:text-fluency-red-500 duration-300 ease-in-out transition-all flex items-center space-x-2 w-52 justify-center font-bold">
              <MdRule />
              <span>Guidelines</span>
            </div>
          }>
          <Card className="w-full">
            <CardBody>
                <Guidelines />
            </CardBody>
          </Card>  
        </Tab>

        <Tab
          key="Material de Apoio"
          title={
            <div className="hover:text-fluency-green-600 hover:dark:text-fluency-green-500 duration-300 ease-in-out transition-all flex items-center space-x-2 w-52 justify-center font-bold">
              <FaHandsHelping />
              <span>Material de Apoio</span>
            </div>
          }>
          <Card>
            <CardBody>
                <MaterialDeApoio />
            </CardBody>
          </Card>  
        </Tab>

        <Tab
          key="Dicas para aulas"
          title={
            <div className="hover:text-fluency-orange-500 hover:dark:text-fluency-orange-500 duration-300 ease-in-out transition-all flex items-center space-x-2 w-52 justify-center font-bold">
              <MdTipsAndUpdates />
              <span>Dicas para aulas</span>
            </div>
          }>
          <Card>
            <CardBody>
                <DicasParaAulas />
            </CardBody>
          </Card>  
        </Tab>
      </Tabs>
    </div>
    );
}