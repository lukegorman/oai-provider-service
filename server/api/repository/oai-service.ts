/*
 * Copyright 2018 Willamette University
 *
 * This file is part of commons-oai-provider.
 *
 * commons-oai-provider is based on the Modular OAI-PMH Server, University of Helsinki, The National Library of Finland.
 *
 *     commons-oai-provider is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     Foobar is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with commons-oai-provider.  If not, see <http://www.gnu.org/licenses/>.
 */

import {OaiProvider, factory} from "./commons-oai-provider";
import {Configuration} from "../../config/configuration";
import logger from '../../common/logger';

export class OaiService {

    public static instance: OaiService;

    parameters: Configuration;

    oaiProvider: OaiProvider;

    MANDATORY_PARAMETERS = ['repositoryName', 'baseURL', 'adminEmail'];
    DEFAULT_PARAMETERS = {
        port: 3000,
        description: 'OAI Provider',
        oaiService: {}
    };

    private constructor() {
        const configuration = new Configuration();
        this.parameters = this.initParameters(configuration)
    }

    private initParameters(parameters: Configuration): any {

        const missingParameters: string[] = this.MANDATORY_PARAMETERS.filter(key => {
            return !Object.hasOwnProperty.call(parameters, key);
        });

        if (missingParameters.length > 0) {
            throw new Error('Mandatory parameters missing: ' + missingParameters.join());
        } else {
            parameters = (<any>Object).assign(JSON.parse(JSON.stringify(this.DEFAULT_PARAMETERS)),
                JSON.parse(JSON.stringify(parameters)));
            const invalidParameters = Object.keys(parameters).filter(key => {
                let result;

                switch (key) {
                    case 'repositoryName':
                        result = typeof parameters[key] !== 'string';
                        break;
                    case 'baseURL':
                        result = typeof parameters[key] !== 'string';
                        break;
                    case 'port':
                        result = typeof parameters[key] !== 'number';
                        break;
                    case 'adminEmail':
                        result = typeof parameters[key] !== 'string' && !Array.isArray(parameters[key]);
                        break;
                    case 'description':
                        result = Object.hasOwnProperty.call(parameters, key) && typeof parameters[key] !== 'string';
                        break;
                    case 'oaiService':
                        result = Object.hasOwnProperty.call(parameters, key) && typeof parameters[key] !== 'object';
                        break;
                    default:
                        break;
                }
                return result;
            });

            if (invalidParameters.length > 0) {
                throw new Error('Invalid parameters: ' + invalidParameters.join());
            } else {
                return parameters;
            }
        }
    }

    public static getInstance(): OaiService {
        try {
            if (this.instance) {
                return this.instance;
            }
            this.instance = new OaiService();
            this.instance.oaiProvider = factory(this.instance.parameters);
            return this.instance;

        } catch(err) {
            throw new Error('Creating the backend module failed: ' + err.message);
        }
    }

    public getParameters(): Configuration {
        return this.parameters;
    }

    public getProvider(): OaiProvider {
        return this.oaiProvider;
    }
}

